import cv2
import face_recognition
import os
import pickle
from datetime import datetime
from app.attendance.attendance_manager import mark_attendance

DATA_DIR = "app/face/data"

FACE_MATCH_TOLERANCE = os.getenv("FACE_MATCH_TOLERANCE", 0.5) 

# Runtime cache: user_id -> date (YYYY-MM-DD)
marked_today = {}


def load_known_faces():
    known_encodings = []
    known_ids = []

    for file in os.listdir(DATA_DIR):
        if file.endswith(".pkl"):
            user_id = file.replace(".pkl", "")
            with open(os.path.join(DATA_DIR, file), "rb") as f:
                encodings = pickle.load(f)
                known_encodings.extend(encodings)
                known_ids.extend([user_id] * len(encodings))

    return known_encodings, known_ids


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
