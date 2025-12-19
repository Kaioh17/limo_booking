from app.db.db_connection import get_supa_db
from supabase import client
from fastapi import Depends, HTTPException, status
from app.utils.logging import logger
from app.utils.password_utils import hash
from . import helper_service, email_service
from datetime import datetime, timezone, timedelta
class UserService:
    TABLE = "users"
    def __init__(self, supa):
        self.supa = supa
    def create_user(self, payload):
        try:
            data = payload.model_dump(exclude={"password", "otp"})
            password = payload.password
            helper = helper_service.UserUtils(self.supa)
            user_ = helper.user_exist(user_email=payload.email)
            hash_password = hash(password)
            """if user exist in db. Check for password. if not password update existing password after confirming OTP from email"""
            if user_:
                _password = self._password(user_[0]['id'])[0]['password']
                if _password is not None:
                    raise HTTPException(status_code=status.HTTP_306_RESERVED,
                                        detail="User with email already exists. Try Login..")
                else: 

                    user = self.supa.table(self.TABLE).update({**data, "password": hash_password}).eq("id", user_[0]['id']).execute()
            else:  
                user = self.supa.table(self.TABLE).insert({**data, "password": hash_password}).execute()
            # self._add_token(self, )

            user_data = user.data[0]
            self._add_token(user_data['id'],user_data['email'])

            return user_data
        except Exception as e:
            logger.debug("error creating user {}".format(e))
            raise e
        
    def get_token(self, token):
        try: 
            return self._check_token(token_entered=token)
        except Exception as e:
            raise e 
    def _add_token(self, user_id, email):
        try:
            expiry = self._expiry()
            token = helper_service.UserUtils(self.supa).generate_token()
            token_ = self.supa.table("otps").insert({"user_id": user_id, "token": token,"expiry_time": expiry }).execute()
            ##notify immediately
            email_service.OTP(email).one_time_password(token)
            return token_.data[0] 
        except Exception as e:
            raise e
    def _expiry(self):
        try:
            # time_now = datetime.now(timezone.utc)
            time_now = datetime.now().astimezone()
            expiry = (time_now + timedelta(minutes=15)).isoformat()
            logger.debug(f"Expiry: {expiry}")
            return expiry
        except Exception as e:
            raise e
    def _check_token(self, token_entered):
        try:
            data = token_entered.model_dump()['token']
            is_user = helper_service.UserUtils(self.supa).user_exist(token_entered.email)
            if len(is_user) == 0:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                        detail="user not found")
            token_data = self.supa.table('otps').select('user_id, expiry_time, token').eq("user_id", is_user[0]["id"]).execute().data[0]
            if not token_data:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                       detail="Email wrong or not in db")
            expiry_time = token_data["expiry_time"]
            user_id = token_data["user_id"]
            logger.debug(f"Expires at : {expiry_time}")
            # Parse the ISO format string from Supabase to datetime
            if isinstance(expiry_time, str):
                expires_at = datetime.fromisoformat(expiry_time.replace('Z', '+00:00'))
            else:
                expires_at = expiry_time
            # Ensure timezone-aware datetime in UTC
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            token = token_data["token"]
            time_now = datetime.now(timezone.utc)
            # expiry_time = created_at + timedelta(minutes=15)
            logger.debug("Time now {} + expiry {}".format(time_now, expiry_time))
            if expires_at > time_now:
                if token != data:
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                       detail="token incorrect")
                self.supa.table(self.TABLE).update({"is_verified": True}).eq("id", user_id).execute()
                return {"msg":"match"}

            else:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                        detail="token expired")
        except Exception as e:
            raise e
        
    def _resend_otp(self, payload):
            try:
                email = payload.model_dump()
                # logger.debug(f"gettng new token for {}")
                is_user = helper_service.UserUtils(self.supa).user_exist(email['email'])
                if len(is_user) == 0:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                        detail="user not found")
                ##check is verified 
                user_id = is_user[0]["id"]
                user_result = self.supa.table('users').select('email').eq("id", user_id)\
                                    .is_("is_verified", False)\
                                    .execute()
                if user_result.data[0] is None:
                    logger.debug("User already verified")
                    raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE,
                                        detail="User already verified")
                token = helper_service.UserUtils(self.supa).generate_token()
                expiry = self._expiry()

                token_ = self.supa.table("otps")\
                        .update({"user_id": user_id, "token": token, "expiry_time": expiry})\
                            .eq("user_id", user_id).execute()
                
                if not token_.data: 
                    logger.debug("No token to update")
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                        detail="No token to update")
                ##notify immediately
                
                email_service.OTP(email['email']).one_time_password(token)
                return {"token sent": "token sent"} 
            except Exception as e:
                raise e
    def request_user(self, payload):
        pass

    def _password(self, id):
        password = self.supa.table(self.TABLE).select("password").eq("id", id).execute()
        data = password.data
        return data


def get_user_service(supa: client = Depends(get_supa_db)):
    return UserService(supa)