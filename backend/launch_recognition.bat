@echo off
REM Face Recognition & Attendance System
REM Simple launcher for the OpenCV face recognition application

cd /d "%~dp0"

echo.
echo ============================================================
echo FACE RECOGNITION ^& ATTENDANCE SYSTEM
echo ============================================================
echo.

REM Activate virtual environment and run
call venv\Scripts\activate.bat
python app/face/recognize_camera.py

pause
