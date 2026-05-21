from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from asgiref.sync import sync_to_async
from Fast_Api.services.chat_service import chat_with_assistant
from Fast_Api.services.chat_db import get_session_history, verify_session

chat_router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

class ChatRequest(BaseModel):
    student_id: int
    message: str
    session_id: Optional[str] = None


@chat_router.post("/assistant")
async def assistant_chat(request: ChatRequest):
    """
    Start or continue a chat session with the internship assistant.
    - If session_id is omitted, a new session is created.
    - If session_id is provided, the existing session's history is used.
    """
    try:
        response = await chat_with_assistant(
            student_id=request.student_id,
            message=request.message,
            session_id=request.session_id
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@chat_router.get("/history/{session_id}")
async def get_history(session_id: str):
    """
    Retrieve full chat history for a given session.
    """
    is_valid = await sync_to_async(verify_session)(session_id)
    if not is_valid:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        history = await sync_to_async(get_session_history)(session_id)
        return {"session_id": session_id, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

