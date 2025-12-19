from pydantic import BaseModel, Field, EmailStr, model_validator
from datetime import datetime
from typing import Optional
from uuid import UUID
from .users import UserCreate, UserResponse
from enum import Enum



class ServiceType(str, Enum):
    drop_off="drop-off"
    airport_service="airport-service"
    Hourly="hourly"

class AirportType(str, Enum):
    from_airport='from_airport'
    to_airport = 'to_airport'
class BookingStatus(str, Enum):
    active = 'active'
    pending = 'pending'
    completed = 'completed' 
    cancelled = 'cancelled'
##TODO if each service demands more unique fields
class DropOff(BaseModel):
    pickup_location: Optional[str] = Field(...)
    dropoff_location: Optional[str] = Field(...)

class AiroportService(BaseModel):
    pickup_type: Optional[AirportType] = Field(..., examples=['from_airport or to_airport'])
# terminal: Optional[str] = Field(...)

class HourlyService(BaseModel):
    hours: Optional[float] = Field(...)
    # pickup_time: Optional[datetime] = Field(...)
class PickupLocationCoordinates(BaseModel):
    lon: Optional[float] =  Field(None, description="longitude of pickup location")
    lat: Optional[float] =  Field(None, description="latitude of pickup location")

class DropoffLocationCoordinates(BaseModel):
    lon: Optional[float] =  Field(None, description="longitude of dropoff location")
    lat: Optional[float] =  Field(None, description="latitude of dropoff location")
class RequestBooking(BaseModel):
    users: Optional[UserCreate] = Field(None)
    service_type: ServiceType = Field(..., description="3 main services(drop off, airport transfers, houorly)")
    pickup_time: Optional[datetime] = Field(None)
    dropoff_time: Optional[datetime] = Field(None)
    pickup_location: Optional[str] = Field(None)
    pickup_location_coordinates: Optional[PickupLocationCoordinates] = Field(None)
    dropoff_location: Optional[str] = Field(None)
    dropoff_location_coordinates: Optional[DropoffLocationCoordinates] = Field(None)
    
    pickup_type: Optional[AirportType] = Field(None, examples=['from_airport or to_airport'])
    hours: Optional[float] = Field(None)
    
    # total_price: float = Field(...)
    # status: str  = Field(...)
    notes: Optional[str] = Field(None)

    @model_validator(mode='after')
    def validate_services(self):
        if self.service_type == ServiceType.airport_service and not self.pickup_type:
            raise ValueError("Airport service selected but no follow up data provided")
        # elif self.pickup_type == AirportType.from_airport and not self.pickup_location and self.pickup_time:
        #     raise ValueError("Airport pickup and dropof time required")
        if self.service_type == ServiceType.drop_off and not self.pickup_location and self.dropoff_location:
            raise ValueError("Drop off service selected but no follow up data provided")
        if self.service_type == ServiceType.Hourly and not self.hours:
            raise ValueError("Hourly service selected but no follow up data provided")
        return self
    

class BookingResponse(BaseModel):
    # user_id: str = Field(...)
    id: str = Field(...)
    users: Optional[UserCreate] = Field(None)
    service_type: ServiceType = Field(..., description="3 main services(drop off, airport transfers, houorly)")
    pickup_time: Optional[datetime] = Field(None)
    dropoff_time: Optional[datetime] = Field(None)
    pickup_location: Optional[str] = Field(None)
    dropoff_location: Optional[str] = Field(None)
    pickup_type: Optional[AirportType] = Field(None, examples=['from_airport or to_airport'])
    hours: Optional[float] = Field(None)
    
    total_price: float = Field(...)
    notes: Optional[str] = Field(None)
    status: str =Field(...)
    created_at: datetime = Field(...)