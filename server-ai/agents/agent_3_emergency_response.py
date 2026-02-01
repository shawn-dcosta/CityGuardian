
import httpx
from .utils import logger

# --- AGENT 3: HEALTHCARE & EMERGENCY RESPONSE ---

async def trigger_emergency_dispatch(report_id, category, latitude, longitude, complaint, name):
    """Triggers the emergency dispatcher webhook."""
    async with httpx.AsyncClient() as http_client:
        try:
            await http_client.post(
                "https://sranger.app.n8n.cloud/webhook/emergency-dispatcher",
                json={
                    "report_id": report_id, "category": category,
                    "latitude": latitude, "longitude": longitude,
                    "issue": complaint, "name": name
                },
                timeout=5
            )
        except Exception as e: logger.error(f"Agent 3 Trigger Failed: {e}")
