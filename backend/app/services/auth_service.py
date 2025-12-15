from fastapi import HTTPException, status, Depends
from fastapi.responses import JSONResponse
import jwt
from app.utils.logging import logger
from app.utils.password_utils import hash, verify
from app.utils.db_error_handling import DBErrorHandler
from app.core.auth_rate_limiter import get_remote_address, check_user_specific_rate_limit, clear_failed_attempts
from app.config import Settings
from app.db.db_connection import get_supa_db
from app.core.oauth2 import create_access_token, create_refresh_token, verify_token


class AuthService:
    settings = Settings()
    table_name = 'users'
    admin_table = 'admin'
    
    def __init__(self, supa):
        self.supa = supa
    async def login(self, request, user_credentials, is_admin: bool = False):
        try:
            ##this works for admins, riders, and drivers
            
            
            client_ip  = get_remote_address(request=request)# get user specific ip
            attempts_key = check_user_specific_rate_limit(email=user_credentials.username,
                                        ip = client_ip)
            if is_admin:
                table_name = self.admin_table
            else:
                table_name = self.table_name
            # elif role  
            response = self.supa.table(table_name).select("*").eq("email", user_credentials.username).execute()
            user = response.data[0] if response.data else None
            
            if is_admin:
                role = 'admin'
            else:
                role = user['role']
            # Validate role
            valid_roles = {"admin", "driver", "rider"}
            if role not in valid_roles:
                logger.error(f"Invalid role provided: {role}")
                raise HTTPException(status_code=400, detail="Invalid role")
            
            # Validate user exists
            if not user:
                logger.warning(f"User not found: {user_credentials.username}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid credentials"
                )
            
            
            logger.info(f"Login attempt for role: {role}")
            # Verify password
            password = user_credentials.password
            if not verify(password, user["password"]):
                logger.warning(f"Invalid password for user: {user_credentials.username}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid credentials"
                )
        
            clear_failed_attempts(attempts_key )
            # Generate access token
            access_token = create_access_token(data={"id": str(user["id"]), "role": str(role)})
            logger.info(f"Login successful for {role}: {user_credentials.username}")
            token_response = JSONResponse(content= {"access_token": access_token})

            # Cookie configuration: secure in production, httpOnly for security
            _secure = False
            is_production = self.settings.app_env.lower() == "production"
            if is_production == "production":
                _secure = True
            
            cookie_max_age = 60 * 30  # 30 minutes (matches access token expiration)
            
            token_response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,  # Prevents JavaScript access (XSS protection)
                secure=_secure,  # HTTPS only in production
                samesite="lax",  # CSRF protection
                max_age=cookie_max_age  # 30 minutes (matches token expiration)
            )
            
            ##refresh token automatically for riders and drivers 
            if not is_admin:
                refresh_token = create_refresh_token(data={"id": str(user["id"]), "role": str(role)})
                token_response.set_cookie(
                    key = "refresh_token",
                    value= refresh_token,
                    httponly=True,
                    secure=_secure, #set to true for production 
                    samesite="lax",
                    max_age=60 * 60 * 24 * 30
                    # Changed from "/api/v1/login/refresh_tenants" to "/api"
                )
            return {"access_token": access_token, "token_type": "bearer"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Login error: {e}")
            DBErrorHandler.handle_supabase(e, "login request")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication failed"
            )
    def refresh_token(self, request):
        """
        Refresh access token using existing token
        
        Args:
            request: FastAPI request object (reads token from header or cookie)
        
        Returns:
            New access token
        
        Raises:
            HTTPException: If token is missing or expired
        """
        try:
            logger.info("Refresh token hit")
            # Try to get token from Authorization header first (for frontend compatibility)
            auth_header = request.headers.get("Authorization")
            refresh_token_value = None
            
            if auth_header and auth_header.startswith("Bearer "):
                refresh_token_value = auth_header.split(" ")[1]
            else:
                # Fallback to cookie (access token can be used for refresh in this design)
                refresh_token_value = request.cookies.get("refresh_token")
            
            if not refresh_token_value:
                logger.error("There is no refresh token...")
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                        detail="No refresh token")
            
            credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid refresh token")
            user = verify_token(refresh_token_value, credentials_exception)
            
            # Create new access token (not refresh token, since we're refreshing the access token)
            new_refresh_token = create_access_token(data={"id": str(user.id), "role": str(user.role)})
            
            return {"access_token": new_refresh_token}
        except jwt.ExpiredSignatureError:
            logger.debug("refresh tokoen failed.... ")
            raise HTTPException(status_code=401, detail="Refresh token expired")

       
def get_authentication_service(supa = Depends(get_supa_db)):
    return AuthService(supa)