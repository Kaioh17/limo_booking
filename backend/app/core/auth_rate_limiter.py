
import hashlib
from pydantic import EmailStr
from slowapi import Limiter,_rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import Settings
from app.utils.redis_connect import redis_client
import redis
from fastapi import HTTPException, status
from app.utils.logging import logger

settings = Settings()

limiter = Limiter(
    key_func= get_remote_address, #rate limit by ip address
    storage_uri = settings.redis_url if settings.redis_url else None,
    default_limits = ["1000/day", "100/hour"]
)

"""Helper Fynctions"""
def _get_user_rate_limit_key(email: EmailStr, ip: str) -> str:
    """
    Create unique key for user and IP combined rate limiting
    
    Args:
        email: User email address
        ip: User IP address
    
    Returns:
        MD5 hash of combined email and IP
    """
    combined = f"{email}:{ip}"
    return hashlib.md5(combined.encode()).hexdigest()

def check_user_specific_rate_limit(email:str, ip:str, max_attempts: int = 3, window_minutes: int = 5):
    """
    Check and update user-specific rate limiting based on email and IP
    
    Args:
        email: User email address
        ip: User IP address
        max_attempts: Maximum allowed attempts (default: 3)
        window_minutes: Time window in minutes (default: 5)
    
    Returns:
        Attempts key string or None if Redis unavailable
    
    Raises:
        HTTPException: If rate limit exceeded (429 Too Many Requests)
    """
    try:
        if redis_client is None:
            logger.warning("Redis unavailable for rate limiting - allowing request")
            return None
        
        user_key = _get_user_rate_limit_key(email, ip)
        attempts_key = f"login_attempts:{user_key}"
        logger.info(f" {attempts_key}")

        current_attempts = redis_client.incr(attempts_key)
        logger.info(f"current_attempts = {current_attempts}")

        #set expiry time 
        if current_attempts == 1:
            redis_client.expire(attempts_key, window_minutes * 60)

        if current_attempts and int(current_attempts) >= max_attempts:
            ttl = redis_client.ttl(attempts_key)
            logger.info(f"Too many failed login attempts. Try again in {ttl} seconds.")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail = f"Too many failed login attempts. Try again in {ttl} seconds."
            )
        return attempts_key
    except (redis.ConnectionError, redis.TimeoutError, AttributeError) as e:
        logger.warning(f"Redis unavailable for rate limiting: {e} - allowing request")
        # Fail open - allow request if Redis is down
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in rate limiting: {e}")
        # Fail open - allow request on unexpected errors
        return None

def record_failed_attempt(attempts_key: str, window_minutes: int = 5):
    """
    Record a failed login attempt in Redis
    
    Args:
        attempts_key: Redis key for tracking attempts
        window_minutes: Time window in minutes for expiration (default: 5)
    """
    try:
        if redis_client is None:
            logger.warning("Redis unavailable for recording failed attempt")
            return
        pipe = redis_client.pipeline()
        pipe.incr(attempts_key)
        pipe.expire(attempts_key, window_minutes * 60)
        pipe.execute()
    except (redis.ConnectionError, redis.TimeoutError, AttributeError) as e:
        logger.warning(f"Redis unavailable for recording failed attempt: {e}")
    except Exception as e:
        logger.error(f"Unexpected error recording failed attempt: {e}")                

def clear_failed_attempts(attempts_key: str):
    """
    Clear failed attempts on successful login
    
    Args:
        attempts_key: Redis key for tracking attempts
    """
    try:
        if redis_client is None:
            logger.warning("Redis unavailable for clearing failed attempts")
            return
        logger.info("attempts_key has been deleted")
        redis_client.delete(attempts_key)
    except (redis.ConnectionError, redis.TimeoutError, AttributeError) as e:
        logger.warning(f"Redis unavailable for clearing failed attempts: {e}")
    except Exception as e:
        logger.error(f"Unexpected error clearing failed attempts: {e}")
