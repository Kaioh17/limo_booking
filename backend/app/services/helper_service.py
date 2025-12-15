import secrets
from app.db.db_connection import get_supa_db
from supabase import client
from fastapi import HTTPException, Depends
from app.utils.logging import logger
from app.utils.db_error_handling import DBErrorHandler, status
from random import random 
from app.schema import schema
class UserUtils:
    def __init__(self, supa):
        self.supa = supa

    def user_exist(self, user_email: str = None, user_id: str=None):
        if user_email:
            logger.debug("verifying user by email {}".format(user_email))

            query = self.supa.table('users').select('email, id').eq('email', user_email).execute()
            logger.debug("verifying user by email {}".format(query.data))

            return query.data
        elif user_id:
            logger.debug("verifying user by id")
            query = self.supa.table('users').select('email, id').eq('id', user_id).execute()
            return query.data
        
    def check_password(self, id):
        pass
        
    def generate_token(self):
        logger.debug("Generating token")
        random_ = secrets.randbelow(1000000)  # Returns 0-999999
        # str(secrets.randbelow(1000000)).zfill(6)  # "000123", "042567", etc.
        
         
        logger.debug("token is: {}".format(random_))

        return random_
    
class StringHelper: 
        def _full_name(first_name: str, last_name: str):
            return "{} {}".format(first_name.capitalize, last_name.capitalize)
class Validates:
    def confirm_password(password, confirm_password):
        if password != confirm_password:
            raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail='Passwords do not match')
        return 
class JsonResponse:
    
    def success_response(message = None, data = None):
        return schema.BaseResponse(success = True, message = message, data = data)
    
    def failed_responsse(message = None, error = None):
        return schema.BaseResponse(success=False, message=message, error=error)
    
class ValidateUser:
    def __init__(self, supa):
        self.supa = supa

    def _ensure_admin(self, current_user):
        if current_user['role'] != 'admin':
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = 'Exclusive to admins only' )
    def _ensure_rider(self, current_user):
        if current_user['role'] != 'rider':
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = 'Exclusive to rider only')