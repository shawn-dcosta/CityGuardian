
import os
import re
import logging
import math
import asyncio
from dotenv import load_dotenv
from google import genai
from fastapi.concurrency import run_in_threadpool

# 1. INITIALIZATION
load_dotenv(override=True)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not set")
    
client = genai.Client(api_key=GEMINI_API_KEY)
GEMINI_MODEL = 'gemini-2.5-flash'

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

async def generate_content_async(contents, model=None, retries=5):
    """Wrapper to run blocking GenAI calls in a thread with automatic retries for 503 errors."""
    if model is None:
        model = GEMINI_MODEL
        
    for attempt in range(retries):
        try:
            response = await run_in_threadpool(
                client.models.generate_content,
                model=model,
                contents=contents
            )
            return response
        except Exception as e:
            error_str = str(e)
            # If 503 High Demand, wait and retry
            if "503" in error_str and attempt < retries - 1:
                wait_time = 2 ** attempt + 1  # 2s, 3s, 5s, 9s Backoff
                logger.warning(f"Gemini API 503 High Demand. Retrying in {wait_time}s... (Attempt {attempt + 1}/{retries})")
                await asyncio.sleep(wait_time)
                continue
                
            logger.error(f"Gemini API Error: {e}")
            print(f"!!! GEMINI API ERROR: {e}") # Explicit print for user visibility
            return None
            
    return None
