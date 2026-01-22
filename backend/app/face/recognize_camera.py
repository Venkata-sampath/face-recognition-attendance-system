#!/usr/bin/env python
"""
Face Recognition & Attendance System - OpenCV GUI
Shows live camera with face detection boxes and IDs
"""
import sys
import os
# Add backend directory to path so imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import cv2
import face_recognition
import numpy as np
from datetime import datetime
from app.attendance.attendance_manager import mark_attendance
from app.face.face_service import get_known_faces_from_db

FACE_MATCH_TOLERANCE = float(os.getenv("FACE_MATCH_TOLERANCE", 0.45))
marked_today = {}

def load_known_faces():
    """Load face encodings from MongoDB instead of local files."""
    return get_known_faces_from_db()

def main():
    print("\n" + "=" * 70)
    print("FACE RECOGNITION & ATTENDANCE SYSTEM")
    print("=" * 70)
    print("\nControls:")
    print("  - Press 'q' to quit")
    print("  - Press 's' to take screenshot")
    print("\nInitializing...")
    
    # Load known faces
    known_encodings, known_ids = load_known_faces()
    
    if not known_encodings:
        print("✗ No registered users found!")
        print("  Please register students in Admin Dashboard first")
        return
    
    print(f"✓ Loaded {len(known_ids)} registered users")
    
    # Open camera
    print("✓ Opening camera...")
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("✗ Camera not accessible!")
        return
    
    print("✓ Camera initialized")
    print("\n" + "=" * 70)
    print("LIVE CAMERA FEED - Press 'q' to exit")
    print("=" * 70 + "\n")
    
    frame_count = 0
    detected_count = 0
    matched_count = 0
    marked_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("✗ Failed to read frame")
            break
        
        frame_count += 1
        height, width = frame.shape[:2]
        
        # Process every 3rd frame for performance
        if frame_count % 3 == 0:
            # Resize for faster processing
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
            
            # Detect faces
            face_locations = face_recognition.face_locations(rgb_small_frame, model="hog")
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
            
            face_labels = []
            
            if face_locations:
                detected_count += 1
                
                # Try to match each detected face
                for face_encoding in face_encodings:
                    distances = face_recognition.face_distance(known_encodings, face_encoding)
                    
                    if len(distances) > 0:
                        best_match_index = np.argmin(distances)
                        best_distance = distances[best_match_index]
                        
                        if best_distance < FACE_MATCH_TOLERANCE:
                            user_id = known_ids[best_match_index]
                            matched_count += 1
                            face_labels.append(user_id)
                            
                            # Try to mark attendance
                            today = datetime.now().strftime("%Y-%m-%d")
                            if marked_today.get(user_id) != today:
                                if mark_attendance(user_id):
                                    marked_today[user_id] = today
                                    marked_count += 1
                                    print(f"  ✓ {user_id} - Attendance marked")
                        else:
                            face_labels.append("Unknown")
                    else:
                        face_labels.append("Unknown")
            
            # Draw boxes and labels on original frame
            for (top, right, bottom, left), label in zip(face_locations, face_labels):
                # Scale coordinates back to original image
                top = int(top * 4)
                right = int(right * 4)
                bottom = int(bottom * 4)
                left = int(left * 4)
                
                # Draw rectangle
                if label == "Unknown":
                    color = (0, 0, 255)  # Red for unknown
                else:
                    color = (0, 255, 0)  # Green for recognized
                
                cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
                
                # Draw label background
                label_y = top - 10 if top > 30 else bottom + 25
                cv2.rectangle(frame, (left, label_y - 25), (right, label_y), color, -1)
                cv2.putText(frame, label, (left + 5, label_y - 5), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        # Add statistics overlay
        cv2.putText(frame, f"Frames: {frame_count}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, f"Detected: {detected_count}", (10, 70), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, f"Matched: {matched_count}", (10, 110), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, f"Marked: {marked_count}", (10, 150), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, "Press 'q' to exit", (width - 300, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
        
        # Display frame
        cv2.imshow("Face Recognition & Attendance System", frame)
        
        # Handle keyboard input
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            print("\n" + "=" * 70)
            print("Session Summary")
            print("=" * 70)
            print(f"Total frames: {frame_count}")
            print(f"Faces detected: {detected_count}")
            print(f"Faces matched: {matched_count}")
            print(f"Attendance marked: {marked_count}")
            print("=" * 70)
            print("Shutting down...\n")
            break
        elif key == ord('s'):
            filename = f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            cv2.imwrite(filename, frame)
            print(f"✓ Screenshot saved: {filename}")
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    print("✓ Camera closed")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
