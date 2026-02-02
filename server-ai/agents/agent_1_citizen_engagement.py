
import json
from google.genai import types
from .utils import generate_content_async, clean_gemini_json, logger

# --- AGENT 1: CITIZEN ENGAGEMENT + AI ANALYSIS ---

async def vision_verifier(image_data: bytes):
    """Verifies if the image shows a legitimate civic issue."""
    prompt = "Analyze if this image shows ANY civic issue or emergency (e.g., road damage, waste, electrical hazard, water/sewage problem, public infrastructure damage, accidents, medical emergencies, fire, crime). If yes, return {'valid': true}. If it is a non-civic/non-emergency image (e.g., selfie, pet, indoor room, random object), return {'valid': false}. Respond ONLY in JSON."
    
    response = await generate_content_async(
        contents=[prompt, types.Part.from_bytes(data=image_data, mime_type="image/jpeg")]
    )
    
    if response:
        try:
            return json.loads(clean_gemini_json(response.text))
        except: pass
    
    # Fallback/Error state - Fail Open
    logger.warning("Vision verifier failed or returned invalid JSON. Defaulting to Valid.")
    return {"valid": True}

async def vision_description_agent(image_data: bytes):
    """Generates a text description from an image."""
    prompt = "Describe the civic issue or emergency in this photo in one clear, formal sentence. If none found, say 'None'."
    
    response = await generate_content_async(
        contents=[prompt, types.Part.from_bytes(data=image_data, mime_type="image/jpeg")]
    )
    
    if response:
        desc = response.text.strip()
        return None if "none" in desc.lower() else desc
    return None

async def classification_agent(complaint: str):
    """Categorizes the issue and sets urgency."""
    prompt = f"Classify this civic complaint into one of these exact categories: Water, Sewage, Roads, Electric, Emergency. \n- Use 'Emergency' for accidents, medical issues, fire, crime, or immediate danger.\n- Use 'Roads' for potholes, pavement issues, traffic.\n- Use 'Water' for leaks, pipes.\n- Use 'Sewage' for drainage, gutters.\n- Use 'Electric' for poles, wires, lights.\n\nRespond ONLY in JSON: {{'category': '...', 'urgency': 'low|medium|high'}}\n\nComplaint: {complaint}"
    
    response = await generate_content_async(contents=prompt)
    
    if response:
        try:
            return json.loads(clean_gemini_json(response.text))
        except: pass
        
    return {"category": "Uncategorized", "urgency": "medium"}

async def drafting_agent(name, email, complaint, location, category, urgency):
    """Drafts a formal municipal email body."""
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
    response = await generate_content_async(contents=prompt)
    return response.text if response else f"Formal report for {category} issue at {location}. Details: {complaint}."

async def analyze_civic_image(image_data: bytes):
    """
    Master Agent: Performs Verification, Description, and Classification in ONE call.
    Reduces API usage by 3x.
    """
    prompt = """
    Analyze this image for civic issues or emergencies.
    1. Verify: Is this a valid civic issue (pothole, waste, electric, water, accident)? (bool)
    2. Describe: Write ONE clear, formal sentence describing the issue.
    3. Classify: Choose EXACTLY one: Water, Sewage, Roads, Electric, Emergency.
    4. Urgency: Choose one: low, medium, high.

    Respond ONLY in JSON:
    {
        "valid": boolean,
        "description": "string",
        "category": "string",
        "urgency": "string",
        "reason": "short reason for validity"
    }
    """
    
    response = await generate_content_async(
        contents=[prompt, types.Part.from_bytes(data=image_data, mime_type="image/jpeg")]
    )
    
    if response:
        try:
            return json.loads(clean_gemini_json(response.text))
        except: pass
            
    # Fallback default
    return {
        "valid": True, 
        "description": "Issue detected from image.", 
        "category": "General", 
        "urgency": "medium",
        "reason": "Fallback"
    }
