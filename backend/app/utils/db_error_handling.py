from sqlalchemy.exc import *
from supabase.lib.client_options import ClientOptions
from app.utils.logging import logger
from fastapi import HTTPException, status
from typing import Union, Optional
import httpx
from postgrest.exceptions import APIError as PostgrestAPIError
# from gotrue.errors import GoTrueAPIError
class DBErrorHandler:
    COMMON_DB_ERRORS = (
        IntegrityError,
        DataError,
        OperationalError,
        SQLAlchemyError,
    )

    COMMON_SUPABASE_ERRORS = (
        httpx.HTTPError,
        httpx.HTTPStatusError,
        PostgrestAPIError,
        Exception,
    )

    @staticmethod
    def handle_sqlalchemy(exc, db):
        """Handle SQLAlchemy database errors"""
        db.rollback()

        if isinstance(exc, IntegrityError):
            logger.error("Integrity constraint failed.")
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                detail="Duplicate or constraint violation.")
        elif isinstance(exc, DataError):
            logger.error("Data formatting or overflow issue.")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Invalid data sent to the database.")
        elif isinstance(exc, OperationalError):
            logger.error("Database is unreachable or broken")
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                                detail="Database temporarily unavailable")
        elif isinstance(exc, SQLAlchemyError):
            logger.error(f"Unexpected SQLAlchemy error: {exc}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail="Unexpected database error.")
        else:
            logger.error(f"Unknown SQLAlchemy error: {exc}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail="Unknown database error.")

    @staticmethod
    def handle_supabase(exc: Union[httpx.HTTPError, httpx.HTTPStatusError, Exception,  PostgrestAPIError,], operation: str = "database operation"):
        """Handle Supabase API errors"""
        if isinstance(exc, PostgrestAPIError):
            logger.error(f"PostgREST error during {operation}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Supabase Auth error: {exc.message if hasattr(exc, 'message') else str(exc)}"
            )
        elif isinstance(exc, httpx.HTTPStatusError):
            # Handle HTTP status errors
            status_code = exc.response.status_code
            error_message = str(exc)
            
            logger.error(f"Supabase HTTP error during {operation}: {error_message} (Status: {status_code})")
            
            if status_code == 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid request. Please check your data."
                )
            elif status_code == 401:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Unauthorized access. Please check your credentials."
                )
            elif status_code == 403:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access forbidden. Insufficient permissions."
                )
            elif status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Resource not found."
                )
            elif status_code == 409:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Conflict. Resource already exists or constraint violation."
                )
            elif status_code == 422:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Validation error. Please check your data format."
                )
            elif status_code == 429:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later."
                )
            elif status_code >= 500:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Supabase service temporarily unavailable. Please try again later."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Supabase API error: {error_message}"
                )
        
        elif isinstance(exc, httpx.HTTPError):
            # Handle general HTTP errors (connection issues, timeouts, etc.)
            logger.error(f"Supabase HTTP error during {operation}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase service temporarily unavailable. Please try again later."
            )
        
        else:
            # Handle other exceptions (including Supabase client errors)
            logger.error(f"Supabase error during {operation}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database operation failed. Please try again later. {exc}"
            )

    @staticmethod
    def handle(exc, db=None, operation: str = "database operation"):
        """Universal error handler for both SQLAlchemy and Supabase errors"""
        
        # Check if it's a Supabase error
        if isinstance(exc, DBErrorHandler.COMMON_SUPABASE_ERRORS):
            return DBErrorHandler.handle_supabase(exc, operation)
        
        # Check if it's a SQLAlchemy error
        elif isinstance(exc, DBErrorHandler.COMMON_DB_ERRORS):
            if db:
                return DBErrorHandler.handle_sqlalchemy(exc, db)
            else:
                logger.error("SQLAlchemy error but no database session provided")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database error occurred."
                )
        
        # Unknown error
        else:
            logger.error(f"Unknown error during {operation}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred."
            )

    @staticmethod
    def handle_supabase_response(response, operation: str = "database operation"):
        """Handle Supabase response errors"""
        if hasattr(response, 'error') and response.error:
            logger.error(f"Supabase response error during {operation}: {response.error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database operation failed: {response.error}"
            )
        return response