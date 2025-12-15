from pydantic import BaseModel
from datetime import datetime
from typing import Any, Optional, Generic, TypeVar

T = TypeVar("T")


class BaseResponse(BaseModel, Generic[T]):
    success: bool
    message: Optional[str] = None
    data: Optional[T] = None
    error: Optional[Any] = None
