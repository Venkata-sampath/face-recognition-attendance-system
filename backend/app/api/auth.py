from fastapi import APIRouter, HTTPException
from app.db.mongo import users_collection
from app.services.auth import verify_password
from app.services.jwt_service import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(user_id: str, password: str):
    user = users_collection.find_one({"user_id": user_id})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": user["user_id"],
        "role": user["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
