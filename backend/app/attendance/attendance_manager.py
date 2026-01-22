from datetime import datetime
from app.db.mongo import attendance_collection

def mark_attendance(user_id):
    today = datetime.now().strftime("%Y-%m-%d")
    now_time = datetime.now().strftime("%H:%M:%S")

    existing = attendance_collection.find_one({
        "user_id": user_id,
        "date": today
    })

    if existing:
        return False

    attendance_collection.insert_one({
        "user_id": user_id,
        "date": today,
        "time": now_time,
        "status": "present"
    })

    return True
