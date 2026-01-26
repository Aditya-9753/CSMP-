from pydantic_settings import BaseSettings
import os

# 🔥 Project root auto-detect
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

class Settings(BaseSettings):
    APP_NAME: str = "CSMP Backend"
    DEBUG: bool = True
    PROTOCOL_VERSION: str = "1.0.0"
    SESSION_TIMEOUT: int = 1800

    # 🔥 AUTO DB PATH (no need to know location)
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'csmp.db')}"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

settings = Settings()
