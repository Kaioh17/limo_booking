import re
from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import datetime
from typing import Optional
from uuid import UUID


class RegisterAdmin(BaseModel):
    first_name: str = (...)
    last_name: str = (...)
    email: EmailStr = (...)
    password: str = (...)
    confirm_password: str = (...)
    
    @field_validator('password')
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v
class RegisterResponse(BaseModel):
    id: UUID =(...)
    first_name: str = (...)
    last_name: str = (...)
    email: EmailStr = (...)