# app/api/health_api.py
from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/")
def health():
    """
    Health check endpoint.
    """
    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "version": settings.PROTOCOL_VERSION,
        "debug": settings.DEBUG
    }