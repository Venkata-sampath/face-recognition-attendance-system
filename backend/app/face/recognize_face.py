import cv2
import face_recognition
import numpy as np
from datetime import datetime
from app.attendance.attendance_manager import mark_attendance
from app.face.face_service import get_known_faces_from_db
import os

FACE_MATCH_TOLERANCE = float(
    os.getenv("FACE_MATCH_TOLERANCE", 0.45)
) 

# Runtime cache: user_id -> date (YYYY-MM-DD)
marked_today = {}


def load_known_faces():
    """Load face encodings from MongoDB instead of local files."""
    return get_known_faces_from_db()


def recognize_from_camera():
    """Single recognition cycle for GUI integration - returns status dict"""
    known_encodings, known_ids = load_known_faces()

    result = {
        "face_detected": False,
        "match_found": False,
        "attendance_marked": False,
        "user_id": None
    }

    if not known_encodings:
        return result

    try:
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        ret, frame = cap.read()
        cap.release()
        
        if not ret or frame is None:
            return result

        today = datetime.now().strftime("%Y-%m-%d")
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Detect faces
        face_locations = face_recognition.face_locations(rgb, model="hog")
        face_encodings = face_recognition.face_encodings(rgb, face_locations)

        if face_locations:
            result["face_detected"] = True

        # Process each face
        for face_encoding in face_encodings:
            distances = face_recognition.face_distance(known_encodings, face_encoding)
            
            if len(distances) > 0:
                best_match_index = np.argmin(distances)
                best_distance = distances[best_match_index]

                # Check if match is good enough
                if best_distance < FACE_MATCH_TOLERANCE:
                    user_id = known_ids[best_match_index]
                    result["match_found"] = True
                    result["user_id"] = user_id

                    # Mark attendance if not already marked today
                    if marked_today.get(user_id) != today:
                        if mark_attendance(user_id):
                            marked_today[user_id] = today
                            result["attendance_marked"] = True
                            print(f"✅ Attendance marked for {user_id}")
        
        return result

    except Exception as e:
        print(f"❌ Error in recognition: {str(e)}")
        return result


def recognize():
    known_encodings, known_ids = load_known_faces()

    if not known_encodings:
        print("❌ No registered users found")
        return

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    print("✅ Recognition started. Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        today = datetime.now().strftime("%Y-%m-%d")

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb)
        face_encodings = face_recognition.face_encodings(rgb, face_locations)

        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            matches = face_recognition.compare_faces(
                known_encodings,
                face_encoding,
                tolerance=FACE_MATCH_TOLERANCE
            )

            name = "Unknown"

            if True in matches:
                match_index = matches.index(True)
                name = known_ids[match_index]

                # ✅ Day-aware runtime guard
                if marked_today.get(name) != today:
                    if mark_attendance(name):
                        marked_today[name] = today
                        print(f"✅ Attendance marked for {name}")

            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(
                frame,
                name,
                (left, top - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2
            )

        cv2.imshow("Face Recognition", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    recognize()
