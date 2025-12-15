from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    supabase_db_url: str
    resend_api_key: str
    app_env: str
    
    redis_url: str 
    redis_host: str
    redis_port: int
    
    secret_key: str 
    algorithm: str 
    access_token_expire_minutes: int
    refresh_token_expire_minutes: int
    
    class Config:
        env_file = "backend/.env"