import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from asgiref.sync import sync_to_async
from django.conf import settings
from apis.models import Student, InternshipOffer, User, CompanyFollow
from apis.services import calculate_skills_match, calculate_location_score, calculate_unified_relevance_score
from Fast_Api.services.chat_db import create_session, verify_session, add_message, get_session_history

from google import genai
from google.genai import types
try:
    import openai
except ImportError:
    openai = None

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


@sync_to_async
def get_top_internship_matches(student_id):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return []

    student_skills_str = ""
    student_wilaya = student.wilaya or ""
    if hasattr(student, 'digital_cv') and student.digital_cv:
        student_skills_str = student.digital_cv.skills or ""
        if student.digital_cv.wilaya:
            student_wilaya = student.digital_cv.wilaya

    internships = InternshipOffer.objects.filter(
        status__in=[
            InternshipOffer.Status.OPEN_FOR_APPLICATION,
            InternshipOffer.Status.ONGOING,
        ]
    ).select_related('company')

    # Pre-fetch followed companies to minimize queries
    followed_company_ids = set(
        CompanyFollow.objects.filter(student=student)
        .values_list('company_id', flat=True)
    )

    scored_internships = []
    for internship in internships:
        is_followed = internship.company_id in followed_company_ids
        relevance_score = calculate_unified_relevance_score(student, internship, is_followed)
        
        scored_internships.append({
            "id": internship.id,
            "title": internship.title,
            "company": internship.company.name if internship.company else "Unknown",
            "location": internship.internship_location,
            "wilaya": internship.wilaya,
            "skills_required": internship.internship_skills,
            "description": internship.description,
            "match_score": relevance_score
        })

    # Sort by match_score descending
    scored_internships.sort(key=lambda x: x["match_score"], reverse=True)
    return scored_internships[:5] # Top 5 matches


@sync_to_async
def get_student_info(student_id):
    try:
        student = Student.objects.get(id=student_id)
        return {
            "name": f"{student.first_name} {student.last_name}",
            "department": student.department,
            "wilaya": student.wilaya
        }
    except Student.DoesNotExist:
        return None


async def chat_with_assistant(student_id, message, session_id=None):
    if not session_id:
        # Create new session
        session_id = await sync_to_async(create_session)(student_id)
    else:
        # Verify session
        is_valid = await sync_to_async(verify_session)(session_id)
        if not is_valid:
            raise ValueError("Invalid session ID or session does not exist.")

    # Save user message
    await sync_to_async(add_message)(session_id, "user", message)

    # Get context data
    student_info = await get_student_info(student_id)
    top_matches = await get_top_internship_matches(student_id)

    # Prepare system prompt
    matches_text = json.dumps(top_matches, indent=2)
    system_prompt = f"""You are a helpful AI assistant for students on a University-Enterprise internship matching platform.
Your goal is to guide the student towards finding the best internship based on their skills and preferences.
Student Name: {student_info['name'] if student_info else 'Student'}
Top 5 Recommended Internships for this student based on backend matching scores:
{matches_text}

Be conversational, concise, and helpful. Recommend these internships if appropriate, or ask clarifying questions to help them narrow down choices.
IMPORTANT FORMATTING RULES:
1. Do NOT use markdown formatting (no asterisks ** for bold, no # for headers). Just use plain text.
2. When mentioning the 'match_score', refer to it as 'Compatibility' and format it as a percentage (e.g., 'Compatibility: 65%').
3. Present options clearly using plain text numbered lists."""

    # Get history
    history = await sync_to_async(get_session_history)(session_id)
    
    provider = getattr(settings, 'OCR_PROVIDER', 'gemini')
    ai_response = "Sorry, I could not generate a response."

    if provider == 'openai':
        if not openai_client:
            raise Exception("OpenAI client not initialized.")
            
        messages = [{"role": "system", "content": system_prompt}]
        for row in history:
            messages.append({"role": "user" if row["role"] == "user" else "assistant", "content": row["content"]})
            
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        ai_response = response.choices[0].message.content.strip()

    else:
        # Default to Gemini
        if not gemini_client:
            raise Exception("Gemini client not initialized.")
            
        # For Gemini, system instructions are passed in the config or as the first user message if model doesn't support system instructions directly via list.
        # gemini-2.0-flash supports system instructions via config.
        contents = []
        for row in history:
            # Gemini expects 'user' and 'model' as roles
            role = 'user' if row['role'] == 'user' else 'model'
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=row["content"])]))
            
        response = gemini_client.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            )
        )
        ai_response = response.text.strip()

    # Save assistant message
    await sync_to_async(add_message)(session_id, "assistant", ai_response)

    return {
        "session_id": session_id,
        "reply": ai_response
    }
