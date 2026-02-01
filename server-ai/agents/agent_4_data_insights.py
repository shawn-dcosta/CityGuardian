
import time
import httpx
import pandas as pd
from datetime import datetime
from io import StringIO
from fastapi import HTTPException
from fastapi.concurrency import run_in_threadpool
from .utils import logger

# --- AGENT 4: DATA INSIGHTS & REPORTING ---

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
