from fastapi import APIRouter, Depends
from app.services.dependencies import get_current_user, require_admin
from app.models.user import UserCreateByAdmin
from app.services.auth import hash_password
from app.db.mongo import users_collection
from datetime import datetime
from fastapi import HTTPException

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
def get_my_profile(current_user=Depends(get_current_user)):
    return current_user


@router.get("/admin-only")
def admin_test(admin_user=Depends(require_admin)):
    return {
        "message": "You are an admin",
        "admin": admin_user
    }

@router.post("/create")
def create_user(
    user: UserCreateByAdmin,
    admin_user=Depends(require_admin)
):
    # Check if user already exists
    existing = users_collection.find_one({"user_id": user.user_id})
    if existing:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    users_collection.insert_one({
        "user_id": user.user_id,
        "password_hash": hash_password(user.password),
        "role": "user",
        "name": user.name,
        "email": user.email,
        "department": user.department,
        "created_at": datetime.utcnow()
    })

    return {
        "message": "User created successfully",
        "user_id": user.user_id
    }