from typing import Optional
from fastapi import FastAPI, APIRouter, Depends, status
from app.services.booking_service import BookingService, get_booking_service
from app.schema import booking, users
from app.services.user_service import UserService, get_user_service

router = APIRouter(prefix="/api/v1/user", tags=["user functions"])


@router.post("/", status_code=202, response_model=users.UserResponse)
def create_user(payload: users.UserCreate, 
                user_service: UserService = Depends(get_user_service)):
    user = user_service.create_user(payload)
    return user 

@router.post("/token", status_code=202)
def get_token(payload: users.GetToken, 
                user_service: UserService = Depends(get_user_service)):
    user = user_service.get_token(payload)
    return user 

@router.post("/resend/token", status_code=202)
def resend_otp(payload: users.ResendCreate, 
                user_service: UserService = Depends(get_user_service)):
    user = user_service._resend_otp(payload)
    return user 
