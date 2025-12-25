import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise Exception("❌ MONGO_URI not found in environment variables")

client = MongoClient(MONGO_URI)

db = client["face_attendance"]
attendance_collection = db["attendance"]
users_collection = db["users"] 

