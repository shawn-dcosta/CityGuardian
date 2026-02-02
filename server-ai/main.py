from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pandas as pd
import uuid
import re 
import base64
from datetime import datetime

# Import Agents and Utils (Simplified)
from agents import (
    logger, 
    calculate_distance,
    fetch_google_sheet_data,
    vision_verifier, 
    vision_description_agent, 
    classification_agent,
    dispatch_notifications,
    classification_agent,
    dispatch_notifications,
    sync_report_data,
    check_semantic_duplicate,
    check_semantic_duplicate,
    send_upvote_event,
    analyze_civic_image
)
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# 1. INITIALIZATION
load_dotenv(override=True)

app = FastAPI(title="CityGuardian Pro – Agentic Backend (Gemini Edition)")

# --- CORS ---
origins = [
    "http://127.0.0.1:5500",
    "https://city-guardian-n8n-integration.vercel.app",
    "https://cityguardian-react.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIG & DATA ---
SHEET_ID = '1-K1ChjL9UyGu8J187MGUYGU5qH3FhUuMFgEl-3CEwW0'

OFFICERS = [
    {"name": "Water Dept", "email": "shivamkillarikar007@gmail.com", "keywords": ["water", "leak", "pipe", "burst"]},
    {"name": "Sewage Dept", "email": "shivamkillarikar22@gmail.com", "keywords": ["sewage", "drain", "gutter", "overflow"]},
    {"name": "Roads Dept", "email": "aishanidolan@gmail.com", "keywords": ["road", "pothole", "pavement"]},
    {"name": "Electric Dept", "email": "adityakillarikar@gmail.com", "keywords": ["light", "wire", "pole", "shock", "power"]},
    {"name": "Emergency Dept", "email": "dcostashawn@gmail.com", "keywords": ["assistance", "doctor", "ambulance", "medical", "accident"]},
]

# --- MAIN ROUTE ---
@app.post("/send-report")
async def send_report(
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    email: str = Form(...),
    complaint: str = Form(None),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(None),
    image: UploadFile = File(None)
):
    # 1. IMAGE & VISION PROCESSING (Agent 1)
    img_b64 = None
    image_bytes = None
    
    # Defaults
    cat = 'Roads'
    urg = 'medium'
    
    if image:
        image_bytes = await image.read()
        img_b64 = base64.b64encode(image_bytes).decode()
        
        # MASTER AGENT CALL (1 Call)
        analysis = await analyze_civic_image(image_bytes)
        
        if not analysis.get("valid"):
            raise HTTPException(status_code=400, detail="Image rejected: Not a civic issue.")

        # Auto-fill description if missing
        if not complaint or complaint.strip() == "" or complaint.lower() == "undefined":
            complaint = analysis.get("description", "Issue detected.")

        # Use AI classification
        cat = analysis.get("category", "General")
        urg = analysis.get("urgency", "medium")

    if not complaint:
        raise HTTPException(status_code=400, detail="No complaint text or image provided.")

    # 2. DUPLICATE CHECK (Geospatial + Semantic)
    try:
        df = await fetch_google_sheet_data(SHEET_ID)
        duplicate_id = None
        original_issue_text = ""
        
        if df is not None:
             # Normalize columns to lowercase for consistent access
             df.columns = [c.strip().lower() for c in df.columns]

        # Check for required columns (lowercase)
        if df is not None and {"status", "location", "issue", "id"}.issubset(df.columns):
            # Filter for Pending status (case-insensitive value check)
            pending = df[df["status"].astype(str).str.lower().str.strip() == "pending"]
            potential_candidates = []

            for _, row in pending.iterrows():
                loc_str = str(row["location"]).replace(" ", "")
                if ',' in loc_str:
                    try:
                        ex_lat, ex_lon = map(float, loc_str.split(','))
                        if calculate_distance(latitude, longitude, ex_lat, ex_lon) < 50:
                             potential_candidates.append({
                                 "id": str(row.get("id")),
                                 "issue": str(row.get("issue", ""))
                             })
                    except ValueError: continue
            
            # Semantic Check (1 Call - Conditional)
            if potential_candidates:
                duplicate_id = await check_semantic_duplicate(complaint, potential_candidates)
                if duplicate_id:
                     # Find the original issue text for context
                     original = next((p for p in potential_candidates if p["id"] == duplicate_id), None)
                     original_issue_text = original["issue"] if original else "Similar Report"

        if duplicate_id:
            # Return specific 409 Conflict with Data
            return JSONResponse(
                status_code=409, 
                content={
                    "status": "duplicate_found",
                    "message": "A similar issue was reported here recently.",
                    "original_report_id": duplicate_id,
                    "original_issue": original_issue_text
                }
            )

    except HTTPException: raise
    except Exception as e: logger.error(f"Duplicate check log: {e}")

    # 3. CLASSIFICATION & ROUTING
    # If we didn't use Image agent (text only), classify now
    if not image:
        cl = await classification_agent(complaint)
        cat = cl.get('category', 'Roads')
        urg = cl.get('urgency', 'medium')
    
    report_id = str(uuid.uuid4())[:8]

    tokens = set(re.findall(r"\b[a-z]+\b", complaint.lower()))
    dept = next((d for d in OFFICERS if any(k in tokens for k in d['keywords'])), None)
    
    if not dept: 
        dept = next((d for d in OFFICERS if d['name'].split()[0].lower() in cat.lower()), OFFICERS[0])

    # 4. DATA SYNC (Synchronous - Critical Path)
    # We await this to ensure data is saved before confirming success to user.
    try:
        await sync_report_data(report_id, name, email, complaint, cat, urg, latitude, longitude)
    except Exception as e:
        logger.error(f"Critical Data Sync Failed: {e}")
        # If persistence fails, deciding whether to fail the request or return partial success.
        # "Right way" = Fail request so user knows to retry.
        raise HTTPException(status_code=500, detail="Failed to save report to database. Please try again.")

    # 5. SIDE EFFECTS (Background - Notifications)
    background_tasks.add_task(
        dispatch_notifications,
        report_id, name, email, complaint, latitude, longitude, address, cat, urg, dept, img_b64
    )

    return {
        "status": "success", 
        "id": report_id,
        "department": dept['name'], 
        "urgency": urg,
        "category": cat,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "location": address if address else f"{latitude},{longitude}",
        "issue": complaint,
        "ai_description": complaint if image else None 
    }

# --- ANALYSIS ENDPOINT ---
@app.post("/analyze-image")
async def analyze_image(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        
        # MASTER VISUAL AGENT (1 Call)
        analysis = await analyze_civic_image(image_bytes)
        
        if not analysis.get("valid"):
             return {"valid": False, "suggestion": "Not a civic issue detected."}

        return {
            "valid": True,
            "suggestion": f"{analysis.get('category', 'Issue')} Detected",
            "description": analysis.get("description", "Issue detected.")
        }
    except Exception as e:
        logger.error(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail="AI Analysis failed")

# --- UPVOTE ENDPOINT ---
class UpvoteRequest(BaseModel):
    report_id: str
    user_email: str

@app.post("/upvote-report")
async def upvote_report(request: UpvoteRequest):
    success = await send_upvote_event(request.report_id, request.user_email)
    if success:
        return {"status": "success", "message": "Report upvoted and subscribed."}
    else:
        raise HTTPException(status_code=500, detail="Failed to process upvote.")

# --- REPORTS ENDPOINT ---
@app.get("/reports")
async def get_reports():
    try:
        # Agent 4
        df = await fetch_google_sheet_data(SHEET_ID)
        if df is None:
            raise HTTPException(status_code=500, detail="Failed to fetch reports")
            
        df.columns = [c.strip() for c in df.columns]
        df = df.astype(object).where(pd.notnull(df), None)
        return df.to_dict(orient='records')
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Error fetching reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch reports data")

@app.get("/")
def health(): return {"status": "active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
