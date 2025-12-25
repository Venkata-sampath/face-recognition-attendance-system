from fastapi import APIRouter, Depends, Query
from app.db.mongo import attendance_collection, users_collection
from datetime import date
from calendar import monthrange
from app.services.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("/me")
def get_my_attendance(current_user=Depends(get_current_user)):
    user_id = current_user["user_id"]

    records = list(
        attendance_collection.find(
            {"user_id": user_id},
            {"_id": 0}  # hide Mongo ObjectId
        ).sort("date", -1)
    )

    return {
        "user_id": user_id,
        "attendance": records
    }


@router.get("/all")
def get_all_attendance(admin_user=Depends(require_admin)):
    records = list(
        attendance_collection.find(
            {},
            {"_id": 0}
        ).sort("date", -1)
    )

    return {
        "count": len(records),
        "attendance": records
    }

@router.get("/summary/me")
def my_monthly_summary(current_user=Depends(get_current_user)):
    user_id = current_user["user_id"]

    today = date.today()
    year = today.year
    month = today.month

    # First day of current month
    month_start = date(year, month, 1)

    # Total days from month start till today
    total_days = (today - month_start).days + 1

    month_prefix = f"{year}-{month:02d}"

    present_days = attendance_collection.count_documents({
        "user_id": user_id,
        "date": {"$regex": f"^{month_prefix}"}
    })

    absent_days = total_days - present_days
    attendance_percentage = round((present_days / total_days) * 100, 2) if total_days else 0.0

    return {
        "user_id": user_id,
        "month": month_prefix,
        "total_days": total_days,
        "present_days": present_days,
        "absent_days": absent_days,
        "attendance_percentage": attendance_percentage
    }

@router.get("/summary/day")
def daily_summary(
    date: str = Query(..., example="2025-01-20"),
    admin_user=Depends(require_admin)
):
    # Count only students (exclude admins)
    total_users = users_collection.count_documents({"role": "user"})

    present_count = attendance_collection.count_documents({
        "date": date
    })

    absent_count = total_users - present_count

    return {
        "date": date,
        "present_count": present_count,
        "absent_count": absent_count
    }