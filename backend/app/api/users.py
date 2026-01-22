from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from app.services.dependencies import get_current_user, require_admin
from app.models.user import UserCreateByAdmin
from app.services.auth import hash_password
from app.db.mongo import users_collection
from datetime import datetime
from app.face.face_service import register_face_from_image
import io

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
def get_my_profile(current_user=Depends(get_current_user)):
    return current_user


@router.get("/all")
def get_all_users(admin_user=Depends(require_admin)):
    """Get all users (admin only). Excludes password hash and face encodings for security."""
    users = list(users_collection.find(
        {"role": "user"},
        {
            "password_hash": 0,
            "face_encodings": 0
        }
    ))
    
    # Convert ObjectId to string for JSON serialization
    for user in users:
        user["_id"] = str(user["_id"])
    
    return {
        "users": users,
        "total": len(users)
    }


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


@router.post("/register-face/{user_id}")
async def register_face(
    user_id: str,
    file: UploadFile = File(...),
    admin_user=Depends(require_admin)
):
    """
    Register face for a user. Requires admin role.
    Accepts image file, processes it, and stores face encodings in MongoDB.
    """
    # Check if user exists
    user = users_collection.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user already has registered face
    if user.get("face_encodings"):
        raise HTTPException(
            status_code=400, 
            detail="User already has a registered face. Re-registration not allowed."
        )
    
    try:
        # Read the uploaded image file
        image_data = await file.read()
        
        # Process face and get encodings
        encodings = register_face_from_image(image_data, user_id)
        
        # Store encodings in MongoDB
        users_collection.update_one(
            {"user_id": user_id},
            {"$set": {
                "face_encodings": encodings,
                "face_registered_at": datetime.utcnow()
            }}
        )
        
        return {
            "message": "Face registered successfully",
            "user_id": user_id,
            "encodings_count": len(encodings)
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing face: {str(e)}")