import cv2
import face_recognition

def main():
    cap = cv2.VideoCapture(0)

    print("Camera opened:", cap.isOpened())

    if not cap.isOpened():
        print("❌ Camera index 0 not accessible")
        return

    print("✅ Webcam started. Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Convert BGR → RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Detect faces
        face_locations = face_recognition.face_locations(rgb_frame)

        # Draw rectangles
        for top, right, bottom, left in face_locations:
            cv2.rectangle(
                frame,
                (left, top),
                (right, bottom),
                (0, 255, 0),
                2
            )

        cv2.imshow("Live Face Detection", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
