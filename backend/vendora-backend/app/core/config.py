from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_ANON_KEY: str
    JWT_SECRET: str
    RESEND_API_KEY: str
    FROM_EMAIL: str
    STORAGE_BUCKET_PDFS: str = "vendora-pdfs"
    STORAGE_BUCKET_ATTACHMENTS: str = "vendora-attachments"
    FRONTEND_URL: str = "http://localhost:5173"
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
