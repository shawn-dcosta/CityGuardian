
import time
import httpx
import pandas as pd
from datetime import datetime
from io import StringIO
from fastapi import HTTPException
from fastapi.concurrency import run_in_threadpool
from .utils import logger, generate_content_async, clean_gemini_json

# --- AGENT 4: DATA INSIGHTS & REPORTING ---

async def check_semantic_duplicate(new_text, existing_reports_list):
    """
    Uses Gemini to semantically compare a new report against a list of existing nearby reports.
    Returns the ID of the duplicate matching report, or None.
    """
    if not existing_reports_list:
        return None

    # Format existing reports for the prompt
    candidates_str = ""
    for r in existing_reports_list:
        candidates_str += f"- ID: {r['id']}, Issue: {r['issue']}\n"

    prompt = f"""
    You are a City Maintenance AI. Determine if a "New Report" is describing the exact same physical issue as any of the "Existing Pending Reports" nearby.
    
    Rules:
    1. "Pothole" and "Broken Road" ARE duplicates if at the same location.
    2. "Streetlight not working" and "Dark street" ARE duplicates.
    3. "Garbage dump" and "Water leak" are NOT duplicates.
    4. If it matches, return the ID of the existing report. If not, return "None".
    
    New Report: "{new_text}"
    
    Existing Pending Reports:
    {candidates_str}
    
    Return ONLY a JSON object: {{ "match_found": boolean, "report_id": "ID_OR_NULL", "reason": "short explanation" }}
    """
    
    try:
        response = await generate_content_async(prompt)
        if response and response.text:
            import json
            cleaned = clean_gemini_json(response.text)
            data = json.loads(cleaned)
            if data.get("match_found") and data.get("report_id"):
                return data["report_id"]
    except Exception as e:
        logger.error(f"Semantic Check Failed: {e}")
    
    return None

async def send_upvote_event(report_id, user_email):
    """Triggers an upvote/subscription event to the n8n webhook."""
    async with httpx.AsyncClient() as http_client:
        try:
            # Using a dedicated webhook for Upvotes/Subscriptions
            # If this webhook doesn't exist yet, it will need to be created in n8n.
            await http_client.post(
                "https://sranger.app.n8n.cloud/webhook/city-report-upvote",
                json={
                    "action": "upvote",
                    "report_id": report_id,
                    "user_email": user_email,
                    "timestamp": datetime.now().isoformat()
                },
                timeout=5
            )
            logger.info(f"Upvote sent for {report_id} by {user_email}")
            return True
        except Exception as e: 
            logger.error(f"Upvote Sync Failed: {e}")
            return False

async def fetch_google_sheet_data(sheet_id):
    """Fetches CSV data from Google Sheets asynchronously."""
    try:
        url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&t={int(time.time())}"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
        
        if response.status_code == 401:
            logger.error(f"AUTH ERROR: Cannot access Sheet {sheet_id}")
            raise HTTPException(status_code=401, detail="Google Sheet is private. Share with 'Anyone with the link'.")
        
        response.raise_for_status()
        
        # Parse CSV in a thread to avoid blocking
        return await run_in_threadpool(pd.read_csv, StringIO(response.text))
    except httpx.HTTPError as e:
        logger.error(f"HTTP Error fetching sheet: {e}")
        return None
    except Exception as e:
        logger.error(f"Error fetching sheet: {e}")
        return None

async def sync_report_data(report_id, name, email, complaint, category, urgency, latitude, longitude):
    """Syncs report data to the City Report Intake webhook."""
    async with httpx.AsyncClient() as http_client:
        try:
            await http_client.post(
                "https://sranger.app.n8n.cloud/webhook/city-report-intake",
                json={
                    "ID": report_id, "Date": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "name": name, "email": email, "issue": complaint,
                    "category": category, "urgency": urgency,
                    "location": f"{latitude},{longitude}", "Status": "Pending"
                },
                timeout=5
            )
        except Exception as e: logger.error(f"Data Sync Failed: {e}")
