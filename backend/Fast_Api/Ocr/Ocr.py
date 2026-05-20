import os
import sys
import io
import re

# Set up Django context
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
from pypdf import PdfReader
from asgiref.sync import sync_to_async
from django.conf import settings
from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import base64

try:
    import openai
except ImportError:
    openai = None

from apis.models import DigitalCV, Student

app = FastAPI(title="CV OCR API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to the specific frontend origin for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
try:
    gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
except Exception as e:
    gemini_client = None

# Initialize OpenAI Client
try:
    if openai and getattr(settings, 'OPENAI_API_KEY', None):
        openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    else:
        openai_client = None
except Exception as e:
    openai_client = None

def extract_text_from_pdf(file_bytes):
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=4, max=15),
    reraise=True
)
def generate_gemini_content(contents):
    return gemini_client.models.generate_content(
        model='gemini-2.0-flash',
        contents=contents,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        )
    )

async def parse_cv_with_ai(file_bytes: bytes, mime_type: str):
    provider = getattr(settings, 'OCR_PROVIDER', 'gemini')
    
    prompt = """
    Extract the following information from this CV. 
    Return ONLY a valid JSON object with these exact keys (use null or empty string if not found):
    "first_name", "last_name", "email", "phone", "github", "linkedin", "profile_summary", "experience", "education".
    Also include "skills" which MUST be an array of strings (e.g., ["React", "Python", "Teamwork"]).
    Extract the detailed blocks of text for 'experience', 'education', and 'profile_summary'.
    Do not hallucinate data; if it is not in the CV, leave it empty.
    """

    if provider == 'openai':
        if not openai_client:
            raise Exception("OpenAI client not initialized (check API key and ensure openai package is installed).")
        
        if mime_type == "application/pdf":
            text = extract_text_from_pdf(file_bytes)
            messages = [
                {"role": "system", "content": "You are a helpful assistant that extracts information from CVs into JSON."},
                {"role": "user", "content": f"{prompt}\n\nCV Text:\n{text}"}
            ]
        else:
            base64_image = base64.b64encode(file_bytes).decode('utf-8')
            messages = [
                {"role": "system", "content": "You are a helpful assistant that extracts information from CVs into JSON."},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ]
            
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            response_format={ "type": "json_object" }
        )
        raw_text = response.choices[0].message.content.strip()

    else:
        # Default to Gemini
        if not gemini_client:
            raise Exception("Gemini client not initialized (check API key).")
            
        if mime_type == "application/pdf":
            text = extract_text_from_pdf(file_bytes)
            contents = [prompt, text]
        else:
            # It's an image, Gemini is multimodal
            # Fix image/jpg to image/jpeg for Gemini compatibility
            gemini_mime_type = mime_type if mime_type != "image/jpg" else "image/jpeg"
            contents = [
                prompt,
                types.Part.from_bytes(data=file_bytes, mime_type=gemini_mime_type)
            ]
            
        response = generate_gemini_content(contents)
        raw_text = response.text.strip()
    
    try:
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        return json.loads(raw_text.strip())
    except Exception as e:
        print(f"RAW AI RESPONSE: {raw_text}") # For debugging in terminal
        raise Exception(f"Failed to parse AI response: {str(e)}\nRaw Response: {raw_text}")

@sync_to_async
def save_cv_data(student_id: int, extracted_data: dict):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return None, "Student not found"

    cv, created = DigitalCV.objects.get_or_create(
        student=student,
        defaults={
            "first_name": student.first_name,
            "last_name": student.last_name,
            "email": student.email,
        }
    )
    
    if "first_name" in extracted_data and extracted_data["first_name"]:
        cv.first_name = extracted_data["first_name"]
    if "last_name" in extracted_data and extracted_data["last_name"]:
        cv.last_name = extracted_data["last_name"]
    if "email" in extracted_data and extracted_data["email"]:
        cv.email = extracted_data["email"]
    if "phone" in extracted_data and extracted_data["phone"]:
        cv.phone = extracted_data["phone"]
    if "github" in extracted_data and extracted_data["github"]:
        cv.github = extracted_data["github"]
    if "linkedin" in extracted_data and extracted_data["linkedin"]:
        cv.linkedin = extracted_data["linkedin"]
    if "skills" in extracted_data and extracted_data["skills"]:
        cv.skills = extracted_data["skills"]
    if "experience" in extracted_data and extracted_data["experience"]:
        cv.experience = extracted_data["experience"]
    if "education" in extracted_data and extracted_data["education"]:
        cv.education = extracted_data["education"]
        
    cv.save()
    return cv, "Success"

@app.post("/api/cv/upload")
async def upload_cv(
    student_id: int = Form(...),
    file: UploadFile = File(...)
):
    valid_content_types = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if file.content_type not in valid_content_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPG, and PNG are supported.")

    file_bytes = await file.read()
    
    try:
        extracted_data = await parse_cv_with_ai(file_bytes, file.content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI parsing failed: {str(e)}")
        
    cv_instance, msg = await save_cv_data(student_id, extracted_data)
    
    if not cv_instance:
        raise HTTPException(status_code=404, detail=msg)
    
    return JSONResponse(status_code=200, content={
        "message": "CV data extracted and saved successfully.",
        "extracted_data": extracted_data,
        "digital_cv_id": cv_instance.id
    })

@app.post("/api/cv/parse")
async def parse_cv(
    file: UploadFile = File(...)
):
    valid_content_types = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if file.content_type not in valid_content_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPG, and PNG are supported.")

    file_bytes = await file.read()
    
    try:
        extracted_data = await parse_cv_with_ai(file_bytes, file.content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI parsing failed: {str(e)}")
        
    return JSONResponse(status_code=200, content={
        "message": "CV data extracted successfully.",
        "extracted_data": extracted_data
    })
