from fastapi.security.oauth2 import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.config import Settings
from app.schema import auth
from app.utils.logging import logger

settings = Settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

SECRET_KEY= settings.secret_key
ALGORITHM= settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES= settings.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_MINUTES = settings.refresh_token_expire_minutes

def create_access_token(data: dict):
    """Create JWT access token with expiration"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes = ACCESS_TOKEN_EXPIRE_MINUTES)
    logger.info(f"Access token expiration: {expire}")
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    """Create JWT refresh token (no expiration)"""
    to_encode = data.copy()
    # TODO: Add refresh token expiration
    expire = datetime.utcnow() + timedelta(minutes = REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, credentials_exception):
    """Verify and decode JWT access token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # logger.info(f"Payload = {payload}")  #debugging only
        
        id: str = str(payload.get("id"))
        role: str = str(payload.get("role"))

        # logger.info(f"Id = {id}")
            
        token_data = auth.TokenData(id=id, role=role)
        # logger.info(f"Token data = {token_data}")

        return token_data
    except JWTError:
        logger.error(f"Error verifying access token")
        raise credentials_exception
    

