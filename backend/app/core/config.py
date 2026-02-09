from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "HOSPITALITY AI OS"
    GCP_PROJECT_ID: str = "hospitality-ai-dev"
    GCP_REGION: str = "us-central1"
    
    # Database
    DATABASE_URL: str = "sqlite:///./test.db"  # Defaults to SQLite for local dev
    
    class Config:
        env_file = ".env"

settings = Settings()
