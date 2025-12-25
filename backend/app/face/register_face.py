import cv2
import face_recognition
import os
import pickle
import numpy as np
from app.db.mongo import users_collection

DATA_DIR = "app/face/data"
os.makedirs(DATA_DIR, exist_ok=True)

def is_duplicate_face(new_encoding, current_uid):
    """
    Checks if the given face encoding already exists
    under a different user_id.
    """
    for file in os.listdir(DATA_DIR):
        if not file.endswith(".pkl"):
            continue

        existing_uid = file.replace(".pkl", "")

        # Skip same user (re-registration allowed)
        if existing_uid == current_uid:
            continue

        with open(os.path.join(DATA_DIR, file), "rb") as f:
            existing_encodings = pickle.load(f)

        matches = face_recognition.compare_faces(
            existing_encodings,
            new_encoding,
            tolerance=0.45  # strict tolerance
        )

        if True in matches:
            return existing_uid  # duplicate found

    return None

def register_user(user_id, samples=10):
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    encodings = []

    print(f"Registering user: {user_id}")
    print("Look at the camera...")

    count = 0
    while count < samples:
        ret, frame = cap.read()
        if not ret:
            continue

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb)

        if len(face_locations) == 1:
            encoding = face_recognition.face_encodings(rgb, face_locations)[0]
            duplicate_uid = is_duplicate_face(encoding, user_id)
            if duplicate_uid:
                print("❌ Duplicate face detected!")
                print(f"➡️ This face already belongs to user: {duplicate_uid}")
                print("➡️ Registration blocked to prevent impersonation.")
                exit(1)
            encodings.append(encoding)
            count += 1
            print(f"Captured sample {count}/{samples}")

            cv2.rectangle(
                frame,
                (face_locations[0][3], face_locations[0][0]),
                (face_locations[0][1], face_locations[0][2]),
                (0, 255, 0),
                2
            )

        cv2.imshow("Face Registration", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

    with open(f"{DATA_DIR}/{user_id}.pkl", "wb") as f:
        pickle.dump(encodings, f)

    print("✅ Registration complete")

if __name__ == "__main__":
    uid = input("Enter User ID / Roll No: ").strip()
    user = users_collection.find_one({"user_id": uid})
    if not user:
        print(f"❌ User '{uid}' does not exist in database.")
        print("➡️ Admin must create the user first.")
        exit(1)
    register_user(uid)
