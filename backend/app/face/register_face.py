import cv2
import face_recognition
import os
import pickle

DATA_DIR = "app/face/data"
os.makedirs(DATA_DIR, exist_ok=True)

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
    uid = input("Enter User ID / Roll No: ")
    register_user(uid)
