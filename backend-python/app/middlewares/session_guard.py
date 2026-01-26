from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.session_engine import SessionEngine
import logging

logger = logging.getLogger(__name__)

async def session_guard(request: Request, call_next):
    """
    Middleware to protect routes by validating x-session-id.
    Attached to request.state for use in routers.
    """
    # 1. Extract Session ID (Header priority, then Query Param)
    session_id = request.headers.get("x-session-id") or request.query_params.get("session_id")

    # 2. Check if Session ID exists
    if not session_id:
        logger.warning(f"❌ Access Denied: Missing session_id for {request.url.path}")
        return JSONResponse(
            status_code=401,
            content={
                "detail": "Identity verification required. Please login.", 
                "code": "SESSION_MISSING"
            }
        )

    # 3. Validate against SessionEngine (In-Memory Store)
    session = SessionEngine.get(session_id)
    
    if not session:
        logger.error(f"❌ Session Invalid/Expired: {session_id}") 
        return JSONResponse(
            status_code=401,
            content={
                "detail": "Session has expired or server was restarted. Please re-login.", 
                "code": "SESSION_NOT_FOUND"
            }
        )

    # 4. Success: Attach session data to request state
    # Ab aap kisi bhi route me `request.state.session` access kar sakte hain
    request.state.session = session
    
    # Next middleware ya router par bhejien
    response = await call_next(request)
    return response