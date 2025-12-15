from fastapi import HTTPException,status
from sqlalchemy.orm import Session 
from sqlalchemy.orm import Session
from fastapi.params import Depends
from . import oauth2
from app.db.db_connection import get_supa_db
from supabase import Client
from app.utils.db_error_handling import DBErrorHandler
from app.utils.logging import logger

def get_current_user(token: str = Depends(oauth2.oauth2_scheme), supa: Client = Depends(get_supa_db)):
    """Validate JWT token and return current admin user"""
    credentials_exception =  HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"could not validate credentials in get current user", 
                                          headers={"WWW-Authenticate": "Bearer"})
    
    try:
       
        token_data = oauth2.verify_token(token, credentials_exception)
        role = token_data.role
        logger.debug(f'Role: {role}')
        if role == 'rider' or role == 'driver':
            table_name = 'users'
        elif role =='admin':
            table_name = 'admin'
        logger.debug(f"table: {table_name} id: {token_data.id}")
        user = supa.table(table_name).select("*").eq("id", token_data.id).execute()  ##switch to general table 
        user_data = user.data[0]
        if not user:
            logger.error("error because no user")
            raise credentials_exception
        
        user_data['role'] = role
        logger.info(f"from current_user: {user_data['role']}")
        return user_data
    except Exception as e:
        DBErrorHandler.handle_supabase(e, "Checking token")
