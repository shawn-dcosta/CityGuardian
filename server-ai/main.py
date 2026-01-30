from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from dotenv import load_dotenv
import requests, base64, os, json, re, math, time
import pandas as pd
from datetime import datetime
import uuid

# 1. INITIALIZATION
load_dotenv(override=True)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)
# Using gemini-2.0-flash for speed and free tier availability

MAILEROO_API_KEY = os.getenv("MAILEROO_API_KEY")

app = FastAPI(title="CityGuardian Pro – Agentic Backend (Gemini Edition)")

# --- CORS ---
origins = [
    "http://127.0.0.1:5500",
    "https://city-guardian-yybm.vercel.app",
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
OFFICERS = [
    {"name": "Water Dept", "email": "shivamkillarikar007@gmail.com", "keywords": ["water", "leak", "pipe", "burst"]},
    {"name": "Sewage Dept", "email": "shivamkillarikar22@gmail.com", "keywords": ["sewage", "drain", "gutter", "overflow"]},
    {"name": "Roads Dept", "email": "aishanidolan@gmail.com", "keywords": ["road", "pothole", "traffic", "pavement"]},
    {"name": "Electric Dept", "email": "adityakillarikar@gmail.com", "keywords": ["light", "wire", "pole", "shock", "power"]},
    {"name": "Emergency Dept", "email": "dcostashawn@gmail.com", "keywords": ["assistance", "doctor", "ambulance", "medical", "accident"]},
]

DEFAULT_EMAIL = "dcostashawn@gmail.com"

# --- UTILS ---
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371000 
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dlat, dlon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def clean_gemini_json(text):
    """Removes markdown code blocks from Gemini response to get clean JSON."""
    clean = re.sub(r"```json\s?|\s?```", "", text).strip()
    return clean

def fetch_google_sheet_data(sheet_id):
    """Fetches CSV data from Google Sheets using requests to handle headers/errors."""
    try:
        url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&t={int(time.time())}"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers)
        
        if response.status_code == 401:
            print(f"❌ AUTH ERROR: Cannot access Sheet {sheet_id}. Check sharing settings (Anyone with link -> Viewer).")
            raise HTTPException(status_code=401, detail="Google Sheet is private. Share with 'Anyone with the link'.")
        
        response.raise_for_status()
        
        from io import StringIO
        return pd.read_csv(StringIO(response.text))
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error fetching sheet: {e}")
        return None
    except Exception as e:
        print(f"Error fetching sheet: {e}")
        return None

# --- AI AGENTS (GEMINI POWERED) ---

def vision_verifier(image_data: bytes):
    """Verifies if the image shows a legitimate civic issue."""
    try:
        prompt = "Is this a civic issue (garbage, pothole, leak, broken light)? Respond ONLY in JSON: {'valid': true/false}"
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[
                prompt,
                types.Part.from_bytes(data=image_data, mime_type="image/jpeg")
            ]
        )
        return json.loads(clean_gemini_json(response.text))
    except Exception as e:
        print(f"Vision Verifier Error: {e}")
        return {"valid": True}

def vision_description_agent(image_data: bytes):
    """Generates a text description from an image for zero-click reporting."""
    try:
        prompt = "Describe the civic issue in this photo in one clear, formal sentence. If none found, say 'None'."
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[
                prompt,
                types.Part.from_bytes(data=image_data, mime_type="image/jpeg")
            ]
        )
        desc = response.text.strip()
        return None if "none" in desc.lower() else desc
    except: return None

def classification_agent(complaint: str):
    """Categorizes the issue and sets urgency."""
    try:
        prompt = f"Classify this civic complaint. Categories: Water, Sewage, Roads, Electric. Respond ONLY in JSON: {{'category': '...', 'urgency': 'low|medium|high'}}\n\nComplaint: {complaint}"
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        return json.loads(clean_gemini_json(response.text))
    except: return {"category": "Roads", "urgency": "medium"}

def drafting_agent(name, email, complaint, location, category, urgency):
    """Drafts a formal municipal email body."""
    try:
       #prompt = f"Write a formal based on Citizen: {name}({email}} Location: {location} Category : {category}  Urgency : {urgency} Issue: {complaint} End exactly with : Thank You /n {name} /n {email} /n Reported Location : {location} ."
        prompt = f"""
Write a formal municipal complaint 3 paragraph detailed email based on the following details:

Citizen: {name} ({email})
Location: {location}
Category: {category}
Urgency: {urgency}
Issue: {complaint}

Rules:
1. Use a professional, respectful, yet firm tone.
2. Explain the public hazard caused by this issue.
3. Keep the email concise but formal (3 paragraphs).

End the email exactly with:
Thank you,
{name}
{email}
Reported Location: {location}
"""
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        return response.text
    except: return f"Formal report for {category} issue at {location}. Details: {complaint}."

# --- MAIN ROUTE ---
@app.post("/send-report")
async def send_report(
    name: str = Form(...),
    email: str = Form(...),
    complaint: str = Form(None),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(None),
    image: UploadFile = File(None)
):
    # 1. IMAGE & VISION PROCESSING
    img_b64 = None
    image_bytes = None
    
    if image:
        image_bytes = await image.read()
        # Keep base64 for Maileroo/email attachment
        img_b64 = base64.b64encode(image_bytes).decode()
        
        # Vision validation with Gemini
        v_check = vision_verifier(image_bytes)
        if not v_check.get("valid"):
            raise HTTPException(status_code=400, detail="Image rejected: Not a civic issue.")

        # Zero-Click Logic: Generate text from image if complaint is empty
        if not complaint or complaint.strip() == "" or complaint.lower() == "undefined":
            complaint = vision_description_agent(image_bytes)
            if not complaint:
                raise HTTPException(status_code=400, detail="Could not identify issue from image.")

    if not complaint:
        raise HTTPException(status_code=400, detail="No complaint text or image provided.")

    # 2. DUPLICATE CHECK (Geospatial + Keyword)
    # SHEET_ID = '1yHcKcLdv0TEEpEZ3cAWd9A_t8MBE-yk4JuWqJKn0IeI'
    SHEET_ID = '1-K1ChjL9UyGu8J187MGUYGU5qH3FhUuMFgEl-3CEwW0'
    try:
        df = fetch_google_sheet_data(SHEET_ID)
        if df is not None:
             df.columns = [c.strip() for c in df.columns]

        if {"Status", "Location", "issue"}.issubset(df.columns):
            pending = df[df["Status"].astype(str).str.lower().str.strip() == "pending"]
            keywords = {"pothole", "drainage", "leak", "garbage", "light", "sewage", "wire"}
            current_keywords = {k for k in keywords if k in complaint.lower()}

            for _, row in pending.iterrows():
                loc_str = str(row["Location"]).replace(" ", "")
                if ',' in loc_str:
                    ex_lat, ex_lon = map(float, loc_str.split(','))
                    if calculate_distance(latitude, longitude, ex_lat, ex_lon) < 50:
                        existing_issue = str(row.get("issue", "")).lower()
                        if any(k in existing_issue for k in current_keywords):
                            raise HTTPException(status_code=409, detail="A similar report is already active in this area.")
    except HTTPException: raise
    except Exception as e: print(f"Duplicate check log: {e}")

    # 3. CLASSIFICATION & ROUTING
    report_id = str(uuid.uuid4())[:8]
    cl = classification_agent(complaint)
    cat = cl.get('category', 'Roads')
    urg = cl.get('urgency', 'medium')

    tokens = set(re.findall(r"\b[a-z]+\b", complaint.lower()))
    dept = next((d for d in OFFICERS if any(k in tokens for k in d['keywords'])), None)
    
    if not dept: 
        dept = next((d for d in OFFICERS if d['name'].split()[0].lower() in cat.lower()), OFFICERS[0])

    if urg == 'high' or urg == 'medium' or cat == 'Electric':
        try:
            n8n_agent_3_url = "https://sranger.app.n8n.cloud/webhook/emergency-dispatcher"
            requests.post(n8n_agent_3_url, json={
                "report_id": report_id,
                "category": cat,
                "latitude": latitude,
                "longitude": longitude,
                "issue": complaint,
                "name": name
            }, timeout=3)
        except Exception as e: print(f"Agent 3 Trigger Failed: {e}")

    # 4. DATA SYNC (n8n & Email)
    loc_display = address if address else f"{latitude}, {longitude}"
    full_loc_info = f"{loc_display}\nMaps: https://www.google.com/maps?q={latitude},{longitude}"

    try:
        # requests.post("https://shivam2212.app.n8n.cloud/webhook/city-report-intake", json={
        #     "ID": report_id, "Date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        #     "name": name, "email": email, "issue": complaint,
        #     "category": cat, "urgency": urg, "location": f"{latitude},{longitude}", "Status": "Pending"
        # }, timeout=5)
        requests.post("https://sranger.app.n8n.cloud/webhook/city-report-intake", json={
            "ID": report_id, "Date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "name": name, "email": email, "issue": complaint,
            "category": cat, "urgency": urg, "location": f"{latitude},{longitude}", "Status": "Pending"
        }, timeout=5)
    except: pass

    email_body = drafting_agent(name, email, complaint, full_loc_info, cat, urg)
    
    try:
        payload = {
            "from": {"address": "no-reply@ead86fd4bcfd6c15.maileroo.org", "display_name": "CityGuardian"},
            "to": [{"address": dept['email']}],
            "subject": f"[{urg.upper()}] New {cat} Report at {loc_display[:20]}...",
            "html": email_body.replace("\n", "<br>")
        }
        if img_b64:
            payload["attachments"] = [{"file_name": "issue.jpg", "content": img_b64, "type": "image/jpeg"}]

        requests.post("https://smtp.maileroo.com/api/v2/emails", 
                      headers={"Authorization": f"Bearer {MAILEROO_API_KEY}", "Content-Type": "application/json"},
                      json=payload, timeout=10)
    except Exception as e: print(f"Email Dispatch failed: {e}")

    return {
        "status": "success", 
        "id": report_id,
        "department": dept['name'], 
        "urgency": urg,
        "ai_description": complaint if image else None 
    }

# --- ANALYSIS ENDPOINT (New) ---
@app.post("/analyze-image")
async def analyze_image(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        
        # 1. Verify if it's a civic issue
        v_check = vision_verifier(image_bytes)
        if not v_check.get("valid"):
             return {"valid": False, "suggestion": "Not a civic issue detected."}

        # 2. Generate Description
        description = vision_description_agent(image_bytes)
        if not description:
            return {"valid": False, "suggestion": "Could not identify issue."}

        # 3. Classify to get a short category name (e.g. "Pothole", "Street Light")
        cl = classification_agent(description)
        category = cl.get('category', 'General Issue')
        
        return {
            "valid": True,
            "suggestion": f"{category} Detected",
            "description": description
        }
    except Exception as e:
        print(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail="AI Analysis failed")

# --- REPORTS ENDPOINT (Proxy for Dashboard) ---
@app.get("/reports")
async def get_reports():
    # Using the same Sheet ID as the duplicate checker to ensure consistency
    SHEET_ID = '1-K1ChjL9UyGu8J187MGUYGU5qH3FhUuMFgEl-3CEwW0' 
    
    try:
        df = fetch_google_sheet_data(SHEET_ID)
        if df is None:
            raise HTTPException(status_code=500, detail="Failed to fetch reports")
            
        # Clean column names
        df.columns = [c.strip() for c in df.columns]
        
        # Handle NaN values (replace with None for valid JSON)
        # Cast to object first so None isn't converted back to NaN
        df = df.astype(object).where(pd.notnull(df), None)
        
        # Convert to dictionary
        data = df.to_dict(orient='records')
        return data
    except HTTPException: raise
    except Exception as e:
        print(f"Error fetching reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch reports data")

@app.get("/")
def health(): return {"status": "active"}

if __name__ == "__main__":
    import uvicorn
    # Using "main:app" string enables reload support
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
