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
    sync_report_data
)

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
    
    if image:
        image_bytes = await image.read()
        # Keep base64 for Maileroo/email attachment
        img_b64 = base64.b64encode(image_bytes).decode()
        
        # Vision validation
        v_check = await vision_verifier(image_bytes)
        if not v_check.get("valid"):
            raise HTTPException(status_code=400, detail="Image rejected: Not a civic issue.")

        # Zero-Click Logic
        if not complaint or complaint.strip() == "" or complaint.lower() == "undefined":
            complaint = await vision_description_agent(image_bytes)
            if not complaint:
                raise HTTPException(status_code=400, detail="Could not identify issue from image.")

    if not complaint:
        raise HTTPException(status_code=400, detail="No complaint text or image provided.")

    # 2. DUPLICATE CHECK (Geospatial + Keyword)
    try:
        df = await fetch_google_sheet_data(SHEET_ID)
        if df is not None:
             df.columns = [c.strip() for c in df.columns]

        if df is not None and {"Status", "Location", "issue"}.issubset(df.columns):
            pending = df[df["Status"].astype(str).str.lower().str.strip() == "pending"]
            keywords = {"pothole", "drainage", "leak", "garbage", "light", "sewage", "wire"}
            current_keywords = {k for k in keywords if k in complaint.lower()}

            for _, row in pending.iterrows():
                loc_str = str(row["Location"]).replace(" ", "")
                if ',' in loc_str:
                    try:
                        ex_lat, ex_lon = map(float, loc_str.split(','))
                        if calculate_distance(latitude, longitude, ex_lat, ex_lon) < 50:
                            existing_issue = str(row.get("issue", "")).lower()
                            if any(k in existing_issue for k in current_keywords):
                                raise HTTPException(status_code=409, detail="A similar report is already active in this area.")
                    except ValueError: continue
    except HTTPException: raise
    except Exception as e: logger.error(f"Duplicate check log: {e}")

    # 3. CLASSIFICATION & ROUTING (Agent 1)
    report_id = str(uuid.uuid4())[:8]
    cl = await classification_agent(complaint)
    cat = cl.get('category', 'Roads')
    urg = cl.get('urgency', 'medium')

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
        
        # 1. Verify
        v_check = await vision_verifier(image_bytes)
        if not v_check.get("valid"):
             return {"valid": False, "suggestion": "Not a civic issue detected."}

        # 2. Description
        description = await vision_description_agent(image_bytes)
        if not description:
            return {"valid": False, "suggestion": "Could not identify issue."}

        # 3. Classify
        cl = await classification_agent(description)
        category = cl.get('category', 'General Issue')
        
        return {
            "valid": True,
            "suggestion": f"{category} Detected",
            "description": description
        }
    except Exception as e:
        logger.error(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail="AI Analysis failed")

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
