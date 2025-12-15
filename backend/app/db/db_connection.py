from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import Settings
from supabase import Client, create_client
import os
from typing import Generator

# Create Base model for SQLAlchemy ORM
Base = declarative_base()

# Lazy initialization - don't create settings at import time
_settings = None
_supabase = None
_engine = None
_SessionLocal = None

def get_settings():
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings

def get_supabase_client():
    global _supabase
    if _supabase is None:
        settings = get_settings()
        url = settings.supabase_url
        key = settings.supabase_service_role_key
        _supabase = create_client(url, key)
    return _supabase

def get_database_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        DATABASE_URL = settings.supabase_db_url
        _engine = create_engine(DATABASE_URL)
    return _engine

def get_session_local():
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_database_engine()
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return _SessionLocal

def get_supa_db() -> Generator[Client, None, None]:
    """
    Dependency to get Supabase client
    """
    try:
        supabase_client = get_supabase_client()
        yield supabase_client
    finally:
        pass
