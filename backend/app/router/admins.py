from typing import Optional
from fastapi import FastAPI, APIRouter, Depends, status
from app.services.booking_service import BookingService, get_booking_service
from app.schema import booking, admin, schema
from app.services.admin_service import AdminService, get_admin_service, get_unauthorized_admin_service
from uuid import UUID
router = APIRouter(prefix="/api/v1/admin", tags=["admin functions"])

@router.patch('/register', response_model=schema.BaseResponse[admin.RegisterResponse])
async def register(payload: admin.RegisterAdmin,
                    admin_service: AdminService = Depends(get_unauthorized_admin_service)):
    
    register = await admin_service.register(payload=payload)
    return register
@router.patch('/booking/{booking_id}')
async def register(status: booking.BookingStatus,
                   booking_id: UUID,
                    admin_service: AdminService = Depends(get_admin_service)):
    
    register = await admin_service.update_booking_status(booking_id=booking_id, status=status)
    return register

@router.get('/booking/analytics',response_model=schema.BaseResponse[admin.Analysis] )
async def register(admin_service: AdminService = Depends(get_admin_service)):
    
    register = await admin_service.analysis_()
    return register
