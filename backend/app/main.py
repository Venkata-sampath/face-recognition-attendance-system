from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.attendance import router as attendance_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Face Recognition Attendance System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(attendance_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
