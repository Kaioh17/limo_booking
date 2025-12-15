import redis
from app.config import Settings 
from urllib.parse import urlparse
from app.utils.logging import logger

def get_redis_client():
    """Get Redis client with proper URL or host/port configuration"""
    settings = Settings()
    
    if settings.redis_url and settings.redis_url.strip():
        # Parse Redis URL (e.g., redis://host:port or rediss://host:port)
        parsed = urlparse(settings.redis_url)
        return redis.Redis(
            host=parsed.hostname or 'localhost',
            port=parsed.port or 6379,
            password=parsed.password,
            ssl=True if parsed.scheme == 'rediss' else False,
            db=0,
            decode_responses=False
        )
    else:
        return redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            db=0
        )

# Lazy initialization - don't connect on import
_redis_client = None

def get_redis():
    """Get Redis client with connection check"""
    global _redis_client
    if _redis_client is None:
        _redis_client = get_redis_client()
        try:
            _redis_client.ping()
            logger.info("✅ Redis Connection successful")
        except redis.ConnectionError as e:
            print (f"❌ Redis connection failed: {e}")
            # Don't fail on import, but log the issue
            # The app can still run without Redis (rate limiting will fail)
    return _redis_client

# Module-level variable for backward compatibility
# This will be initialized on first access
redis_client = None

def _init_redis_client():
    """Initialize module-level redis_client for backward compatibility"""
    global redis_client
    if redis_client is None:
        redis_client = get_redis()
    return redis_client

# Initialize on import for backward compatibility
# This maintains the existing API while using the new implementation
# try:
#     redis_client = get_redis()
# except Exception as e:
#     logger.warning(f"Failed to initialize Redis on import: {e}")
#     redis_client = None
