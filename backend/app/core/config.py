import os
from typing import Any
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Verity-AI Backend"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
    APP_DEBUG: bool = os.getenv("APP_DEBUG", "false").lower() in ("1", "true", "yes")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "changeme123")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_SECONDS: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_SECONDS", "3600"))
    STORAGE_PATH: str = os.getenv("STORAGE_PATH", "./storage")

    model_config = {"env_file": ".env"}

settings = Settings()
