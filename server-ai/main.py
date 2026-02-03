from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pandas as pd
import uuid
import re 
import base64
import os
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
    sync_report_data,
    check_semantic_duplicate,
    send_upvote_event,
    analyze_civic_image
)
from fastapi.responses import JSONResponse
import starlette.responses
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
    image: UploadFile = File(None),
    category: str = Form(None),  # User-verified category
    urgency: str = Form(None)    # User-verified urgency
):
    # 1. IMAGE & VISION PROCESSING (Agent 1)
    img_b64 = None
    image_bytes = None
    
    # Defaults (Use provided values if available)
    cat = category if category else 'Roads'
    urg = urgency if urgency else 'medium'
    
    if image:
        image_bytes = await image.read()
        img_b64 = base64.b64encode(image_bytes).decode()
        
        # We only need to run AI strictly if we DON'T have a valid category/urgency from frontend
        # OR if we just want to validate validity.
        # But for consistency, let's respect the frontend's explicit fields if provided.
        
        if not category or not urgency:
             # MASTER AGENT CALL (Only if data missing)
             analysis = await analyze_civic_image(image_bytes)
             
             if not analysis.get("valid"):
                 raise HTTPException(status_code=400, detail="Image rejected: Not a civic issue.")

             # Auto-fill description if missing
             if not complaint or complaint.strip() == "" or complaint.lower() == "undefined":
                 complaint = analysis.get("description", "Issue detected.")

             # Use AI classification if not provided by user
             if not category: cat = analysis.get("category", "General")
             if not urgency: urg = analysis.get("urgency", "medium")
        else:
            # If skipping analysis, ensures complaint has a fallback
            if not complaint or complaint.strip() == "" or complaint.lower() == "undefined":
                complaint = f"Image Report - {cat} Issue"
    
    if not complaint:
        # Final safety check
        complaint = "No description provided."

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
    # If we didn't use Image agent (text only) AND didn't get form data
    if not image and (not category or not urgency):
        cl = await classification_agent(complaint)
        if not category: cat = cl.get('category', 'Roads')
        if not urgency: urg = cl.get('urgency', 'medium')
    
    report_id = str(uuid.uuid4())[:8]

    # Department Logic
    tokens = set(re.findall(r"\b[a-z]+\b", complaint.lower()))
    dept = next((d for d in OFFICERS if any(k in tokens for k in d['keywords'])), None)
    
    if not dept: 
        dept = next((d for d in OFFICERS if d['name'].split()[0].lower() in cat.lower()), OFFICERS[0])
    
    # 4. DATA SYNC (Synchronous - Critical Path)
    # Save Image Locally if present (CRITICAL FIX)
    img_path = None


    # We await this to ensure data is saved before confirming success to user.
    try:
        print(f"DEBUG: Syncing report {report_id} | Cat: {cat} | Urg: {urg}")
        data_synced = await sync_report_data(report_id, name, email, complaint, cat, urg, latitude, longitude, img_path)
        
        if not data_synced:
             print("DEBUG: Sync returned False")
             raise Exception("Webhook sync returned False (Check n8n/Network)")
        
        print("DEBUG: Sync Successful")
        
    except Exception as e:
        logger.error(f"Critical Data Sync Failed: {e}")
        # Return detailed error to help debugging
        raise HTTPException(status_code=500, detail=f"Database Sync Failed: {str(e)}")

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
            "suggestion": analysis.get('category', 'Issue'), # Frontend expects 'suggestion' as category
            "category": analysis.get('category', 'Issue'),   # Sending explicit key too
            "description": analysis.get("description", "Issue detected."),
            "urgency": analysis.get("urgency", "medium")    # Now explicitly sending urgency
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

# --- IMAGE PROXY (For PDF Generation) ---
import httpx
@app.get("/proxy-image")
async def proxy_image(url: str):
    """
    Proxies external image URLs to bypass CORS for client-side PDF generation.
    """
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, follow_redirects=True)
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "image/jpeg")
            return starlette.responses.Response(content=resp.content, media_type=content_type)
    except Exception as e:
        logger.error(f"Proxy failed for {url}: {e}")
        raise HTTPException(status_code=400, detail="Failed to fetch image")

# --- BACKEND PDF GENERATION ---
from fpdf import FPDF
import io
from fastapi.responses import StreamingResponse

@app.get("/report-pdf/{report_id}")
async def generate_report_pdf(report_id: str):
    """
    Generates the PDF report server-side to avoid CORS issues with images.
    """
    # 1. Fetch Data
    df = await fetch_google_sheet_data(SHEET_ID)
    if df is None:
        raise HTTPException(status_code=404, detail="Report data not found")
    
    # Normalize and Find Report
    df.columns = [c.strip().lower() for c in df.columns]
    report = None
    # Convert ID to string for comparison
    df['id'] = df['id'].astype(str)
    
    matches = df[df['id'] == str(report_id)]
    if matches.empty:
        raise HTTPException(status_code=404, detail="Report not found")
    
    row = matches.iloc[0]
    
    # 2. Setup PDF
    pdf = FPDF()
    pdf.add_page()
    
    # Header Blue Bar
    pdf.set_fill_color(37, 99, 235) # Blue
    pdf.rect(0, 0, 210, 40, 'F')
    
    # Title
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("helvetica", "B", 22)
    pdf.text(20, 25, "CityGuardian Report")
    
    # ID
    pdf.set_font("helvetica", "", 10)
    pdf.text(150, 25, f"ID: #{report_id}")
    
    # Reset Color
    pdf.set_text_color(33, 33, 33)
    
    # Category (Title)
    pdf.set_font("helvetica", "B", 16)
    category = str(row.get('category', 'Issue Report'))
    pdf.text(20, 60, category)
    
    # Status & Urgency Badges (Simulated with text/rect)
    status = str(row.get('status', 'Pending'))
    urgency = str(row.get('urgency', 'Medium')).capitalize()
    
    pdf.set_draw_color(37, 99, 235)
    pdf.set_fill_color(239, 246, 255) # Light Blue
    pdf.rect(20, 65, 40, 10, 'FD')
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(37, 99, 235)
    pdf.text(25, 71, status)
    
    # Content
    pdf.set_text_color(60, 60, 60)
    pdf.set_font("helvetica", "", 12)
    pdf.text(20, 90, "Description:")
    
    pdf.set_font("helvetica", "I", 12)
    issue_desc = str(row.get('issue', 'No description.'))
    pdf.set_xy(20, 95)
    pdf.multi_cell(170, 7, issue_desc)
    
    y = pdf.get_y() + 10
    
    # Metadata
    pdf.set_font("helvetica", "B", 12)
    pdf.text(20, y, "Location:")
    pdf.set_font("helvetica", "", 12)
    loc = str(row.get('location', 'Unknown'))
    pdf.text(60, y, loc)
    
    y += 10
    pdf.set_font("helvetica", "B", 12)
    pdf.text(20, y, "Date:")
    pdf.set_font("helvetica", "", 12)
    date_str = str(row.get('date', 'Unknown'))
    pdf.text(60, y, date_str)
    
    y += 20
    
    # Image Embedding
    img_url = str(row.get('image', ''))
    print(f"DEBUG: Generating PDF for {report_id}. Image URL from Sheet: '{img_url}'")
    
    if img_url and img_url.lower() != 'nan' and img_url.lower() != 'none':
        try:
            # Check if it's a remote URL
            if img_url.startswith('http'):
                 print(f"DEBUG: Fetching remote image: {img_url}")
                 async with httpx.AsyncClient() as client:
                    resp = await client.get(img_url, follow_redirects=True)
                    if resp.status_code == 200:
                         img_data = io.BytesIO(resp.content)
                         pdf.text(20, y, "Evidence:")
                         pdf.image(img_data, x=20, y=y+5, w=100)
                    else:
                        print(f"DEBUG: Failed to fetch remote image. Status: {resp.status_code}")


        except Exception as e:
            print(f"DEBUG: Exception during image embedding: {e}")
            logger.error(f"Failed to embed image in PDF: {e}")
            
    # Footer
    pdf.set_y(-20)
    pdf.set_font("helvetica", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 10, "Generated by CityGuardian System", align='C')

    # Output
    pdf_bytes = pdf.output() 
    
    return StreamingResponse(
        io.BytesIO(bytes(pdf_bytes)), 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Report_{report_id}.pdf"}
    )
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
