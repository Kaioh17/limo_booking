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
        self.response = helper_service.JsonResponse
        
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
        try:
            booking_data = self.supa.table('bookings').select("*, users(*)").eq("id", booking_id).execute().data[0]
            
            logger.debug(f"Change status to {status}...")
            if status.lower() != 'completed':
                if booking_data["status"] == 'completed':
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='You cannot perform this task. It is already sompleted')
            
            self.supa.table('bookings').update({'status': status.lower()}).eq("id", booking_id).execute()
            logger.debug(f"Changed status to {status}")
            ##email name
            notify = email_service.BookingEmails(email=booking_data['users']['email'])
            if status.lower() == "active":
                notify.ride_active(booking_data)
            if status.lower() == "completed":
                notify.ride_completed(booking_data)
            elif status.lower() == "cancelled":
                notify.ride_cancelled(booking_data)
            # notify.admin(booking_data)
            
            return {"status": status}
        except Exception as e:
            DBErrorHandler.handle_supabase(exc=e, operation='Updating booking status: ')
            raise e
    async def analysis_(self):
        response = self.supa.table('bookings').select("*").execute()
        response_data = response.data
        analysis_dict = {}
        analysis_dict["total_bookings"] = len(response_data)
        total_revenue = 0
        total_price = 0
        count_completed = 0
        for i in range(len(response_data)):
            # logger.debug(response_data[i]["is_approved"])
            if response_data[i]["status"] == "completed":
                count_completed += 1
                total_price = response_data[i]["total_price"]   
            total_revenue += total_price
        analysis_dict["total_revenue"] = round(total_revenue, 2)
        analysis_dict["completed_rides"] = count_completed
        
        logger.debug(f"Admin analysis: {analysis_dict}")
        
        return self.response.success_response('Successfully analysis',  analysis_dict)
def get_admin_service(supa = Depends(get_supa_db), current_admin = Depends(get_current_user)):
    return AdminService(supa, current_admin)

def get_unauthorized_admin_service(supa = Depends(get_supa_db)):
    return AdminService(supa, None)