from fastapi import FastAPI, APIRouter, Request, Depends
from app.services.auth_service import AuthService, get_authentication_service
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
router  = APIRouter(prefix='/api/v1/auth')


@router.post('/login', status_code=202)
async def login(request: Request,
                is_admin: bool,
                auth_service:  AuthService = Depends(get_authentication_service),
                user_credentials: OAuth2PasswordRequestForm = Depends()
                ):
    auth = await auth_service.login(request=request, user_credentials=user_credentials, is_admin=is_admin)
    return auth 


@router.post('/refresh', status_code=202)
async def login(request: Request,
                auth_service:  AuthService = Depends(get_authentication_service),
                ):
    refresh = auth_service.refresh_token(request=request)
    return refresh 