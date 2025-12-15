from typing import Optional
from fastapi import FastAPI, APIRouter, Depends, status, HTTPException
from app.services.booking_service import BookingService, get_booking_service, get_authorized_booking_service
from app.schema import booking
from app.schema.schema import BaseResponse
from uuid import UUID

router = APIRouter(prefix="/api/v1/book", tags=["booking functions"])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=BaseResponse[booking.BookingResponse])
async def request_booking( 
                        #   lon1: float, lat1: float, lat2: float, lon2: float,
                            payload: booking.RequestBooking,
                           booking_service: BookingService = Depends(get_booking_service)):

    booking_result = booking_service.request_book(payload)
    return booking_result
@router.patch("/", status_code=status.HTTP_201_CREATED)
async def approve_price(id: UUID,is_approve: bool = False,booking_service: BookingService = Depends(get_booking_service)):

    booking_result = booking_service.approve_price(booking_id=id, is_approved=is_approve)
    return booking_result

@router.get("/all", status_code=200, response_model=BaseResponse[list[booking.BookingResponse]])
async def get_booking(booking_service: BookingService = Depends(get_authorized_booking_service), ):

    booking_result = booking_service.get_all_bookings()
    return booking_result
####Users 

@router.get("/{booking_id}", status_code=200, response_model=BaseResponse[booking.BookingResponse])
async def get_booking(booking_id: UUID,
                      booking_service: BookingService = Depends(get_authorized_booking_service), ):

    booking_result = booking_service.get_all_bookings(booking_id=booking_id)
    return booking_result

@router.get("/all/{id}", status_code=200, response_model=BaseResponse[booking.BookingResponse])
async def get_booking(id: str, booking_service: BookingService = Depends(get_authorized_booking_service)):

    booking_result = booking_service.get_book(id)
    return booking_result

@router.get("/", status_code=200, response_model=BaseResponse[list[booking.BookingResponse]])
async def get_booking(booking_service: BookingService = Depends(get_authorized_booking_service)):
    raise HTTPException(status_code=status.HTTP_410_GONE, detail="Not available for use")
    booking_result = booking_service.get_book()
    return booking_result
