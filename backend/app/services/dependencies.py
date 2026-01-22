from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.db.mongo import users_collection
from app.services.jwt_service import SECRET_KEY, ALGORITHM

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    print("DEBUG: Authorization header received")

    token = credentials.credentials
    print("DEBUG: Token received:", token[:20], "...")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    token = credentials.credentials
    if token.lower().startswith("bearer "):
        token = token.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")

        if user_id is None or role is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = users_collection.find_one({"user_id": user_id})
    if not user:
        raise credentials_exception

    # Return all user fields except password_hash and face_encodings
    user_data = {
        "user_id": user["user_id"],
        "role": user["role"],
        "name": user.get("name"),
        "email": user.get("email"),
        "department": user.get("department"),
        "created_at": user.get("created_at"),
        "face_registered_at": user.get("face_registered_at")
    }
    
    # Convert ObjectId to string if present
    if "_id" in user:
        user_data["_id"] = str(user["_id"])
    
    return user_data


def require_admin(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
