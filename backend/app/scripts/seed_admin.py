from app.db.mongo import users_collection
from app.services.auth import hash_password
from datetime import datetime
import os

ADMIN_ID = os.getenv("ADMIN_ID")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

existing = users_collection.find_one({"user_id": ADMIN_ID})

if existing:
    print("Admin already exists")
else:
    users_collection.insert_one({
        "user_id": ADMIN_ID,
        "password_hash": hash_password(ADMIN_PASSWORD),
        "role": "admin",
        "name": "Super Admin",
        "email": None,
        "department": None,
        "created_at": datetime.utcnow()
    })
    print("Admin user created successfully")
