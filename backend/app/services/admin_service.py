from app.db.db_connection import get_supa_db
from supabase import client
from fastapi import Depends, HTTPException, status
from app.utils.logging import logger
from app.utils.password_utils import hash
from . import helper_service, email_service
from datetime import datetime, timezone, timedelta
from app.core.deps import get_current_user
from app.utils.password_utils import hash
from app.utils.db_error_handling import DBErrorHandler

class AdminService:
    
    def __init__(self, supa, current_admin):
        self.supa = supa
        self.current_admin = current_admin
        if self.current_admin:
            helper_service.ValidateUser(self.supa)._ensure_admin(self.current_admin)
    async def register(self, payload):
        try:
            payload = payload.model_dump()
            email = payload['email']
            first_name=payload['first_name']
            last_name = payload['last_name']
            full_name = helper_service.StringHelper._full_name(first_name=first_name, 
                                                            last_name = last_name)
            password = payload['password']
            confirm_password = payload['confirm_password']
            ##ensure no password
            self._if_password(email=email, _want=True)
            helper_service.Validates.confirm_password(password=password, confirm_password=confirm_password)            
            hashed_password = hash(password)
            response = self.supa.from_('admin').update({'password': hashed_password}).eq('email', email).eq('first_name', first_name).eq('last_name', last_name).execute()
            if not response.data:
                logger.debug('first_name, last_name or email not with us...')
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                    detail='Email entered not with us....')
            response_data = response.data[0]
            ##notify admin 
            notify = email_service.AdminEmail(email=email)
            notify.notify_new_password(name=full_name)
            
            return helper_service.JsonResponse.success_response(message="Success fully registered account...", data = response_data)
        except Exception as e:
            DBErrorHandler.handle_supabase(exc=e, operation='Updating password')
            raise e
    def _if_password(self, email, _want: bool = False):
        try:
            response = self.supa.table('admin').select('password').eq('email', email).execute().data[0]['password']
            if _want:
                if response: 
                    logger.error('Admin already registered....') 
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='This admin already has a functioning password') 
            elif not _want: 
                if not response:
                    return
        except Exception as e:
            DBErrorHandler.handle_supabase(exc=e, operation='Checking password...')
            raise e

    async def update_booking_status(self, booking_id, status):
        logger.debug(f"Change status to {status}...")
        self.supa.table('bookings').update({'status': status}).eq("id", booking_id).execute()
        logger.debug(f"Changed status to {status}")
        
        return {"status": status}
        
def get_admin_service(supa = Depends(get_supa_db), current_admin = Depends(get_current_user)):
    return AdminService(supa, current_admin)

def get_unauthorized_admin_service(supa = Depends(get_supa_db)):
    return AdminService(supa, None)