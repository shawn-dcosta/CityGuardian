
import os
import httpx
from .utils import logger
from .agent_1_citizen_engagement import drafting_agent
from .agent_3_emergency_response import trigger_emergency_dispatch
from .agent_4_data_insights import sync_report_data # Keep import for typing/reference if needed, but unused here now

# --- AGENT 0: ORCHESTRATOR (CITY BRAIN) ---

MAILEROO_API_KEY = os.getenv("MAILEROO_API_KEY")

async def dispatch_notifications(
    report_id: str,
    name: str,
    email: str,
    complaint: str,
    latitude: float,
    longitude: float,
    address: str,
    category: str,
    urgency: str,
    dept: dict,
    img_b64: str
):
    """Handles side effects (emails, emergency triggers) that don't need to block response."""
    loc_display = address if address else f"{latitude}, {longitude}"
    full_loc_info = f"{loc_display}\nMaps: https://www.google.com/maps?q={latitude},{longitude}"
    
    # 1. Agent 3 Trigger (Emergency/High Priority)
    if urgency in ['high', 'medium'] or category == 'Electric':
        await trigger_emergency_dispatch(report_id, category, latitude, longitude, complaint, name)

    # 2. Agent 1 Task (Drafting) & Email Dispatch (Orchestrator Action)
    email_body = await drafting_agent(name, email, complaint, full_loc_info, category, urgency)
    
    try:
        payload = {
            "from": {"address": "no-reply@ead86fd4bcfd6c15.maileroo.org", "display_name": "CityGuardian"},
            "to": [{"address": dept['email']}],
            "subject": f"[{urgency.upper()}] New {category} Report at {loc_display[:20]}...",
            "html": email_body.replace("\n", "<br>")
        }
        if img_b64:
            payload["attachments"] = [{"file_name": "issue.jpg", "content": img_b64, "type": "image/jpeg"}]

        # Send using httpx
        async with httpx.AsyncClient() as http_client:
            await http_client.post(
                "https://smtp.maileroo.com/api/v2/emails",
                headers={"Authorization": f"Bearer {MAILEROO_API_KEY}", "Content-Type": "application/json"},
                json=payload,
                timeout=10
            )
    except Exception as e: logger.error(f"Email Dispatch failed: {e}")
