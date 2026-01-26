import redis
import logging
from app.config import settings

logger = logging.getLogger(__name__)

try:
    redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=0,
        decode_responses=True,
        socket_connect_timeout=2,
        socket_timeout=2,
    )
    redis_client.ping()
    logger.info("✅ Redis connected")
except Exception as exc:
    redis_client = None
    logger.warning(f"⚠️ Redis unavailable: {exc}")
