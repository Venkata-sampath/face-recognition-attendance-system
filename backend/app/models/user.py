from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    user_id: str            # roll no / employee id
    password: str
    role: str = "user"      # user or admin
    name: str
    email: Optional[EmailStr] = None
    department: Optional[str] = None


class UserInDB(BaseModel):
    user_id: str
    password_hash: str
    role: str
    name: str
    email: Optional[str]
    department: Optional[str]
    created_at: datetime

class UserCreateByAdmin(BaseModel):
    user_id: str          # must match face ID
    password: str
    name: str
    email: str | None = None
    department: str | None = None

