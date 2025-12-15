from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional

class UserLogin(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(...)

class UserCreate(BaseModel):
    first_name: str = Field(...)
    last_name: str = Field(...)
    email: EmailStr = Field(...)
    phone: str = Field(...)
    password: Optional[str] = Field(None)

class ResendCreate(BaseModel):
    email: EmailStr = Field(...)

class GetToken(BaseModel):
    email: EmailStr = Field(...)
    token: int = Field(...)

class UserResponse(BaseModel):
    id: str  =Field(...)
    first_name: str = Field(...)
    last_name: str = Field(...)
    email: EmailStr = Field(...)
    phone: str = Field(...)