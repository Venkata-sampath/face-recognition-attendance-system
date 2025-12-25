from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.attendance import router as attendance_router

app = FastAPI(
    title="Face Recognition Attendance System",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(attendance_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
