"""
Face processing service for registration and recognition.
Bridges API endpoints with face recognition models.
"""
import cv2
import face_recognition
import numpy as np
from io import BytesIO
from app.db.mongo import users_collection


def register_face_from_image(image_data: bytes, user_id: str, samples: int = 10):
    """
    Process a single image and generate face encodings.
    
    Args:
        image_data: Raw image bytes (JPEG/PNG)
        user_id: User ID to register
        samples: Number of encoding samples (not used for single image, kept for compatibility)
    
    Returns:
        List of face encodings (as lists of floats for JSON serialization)
    
    Raises:
        ValueError: If no face found or duplicate face detected
    """
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if frame is None:
        raise ValueError("Invalid image format")
    
    # Convert BGR to RGB
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Detect faces
    face_locations = face_recognition.face_locations(rgb)
    
    if len(face_locations) == 0:
        raise ValueError("No face detected in the image")
    
    if len(face_locations) > 1:
        raise ValueError("Multiple faces detected. Please provide an image with only one face")
    
    # Generate encoding for detected face
    encodings = face_recognition.face_encodings(rgb, face_locations)
    
    if not encodings:
        raise ValueError("Could not generate face encoding")
    
    # Check for duplicate faces
    duplicate_uid = is_duplicate_face(encodings[0], user_id)
    if duplicate_uid:
        raise ValueError(f"This face already belongs to user: {duplicate_uid}. Registration blocked to prevent impersonation.")
    
    # Convert numpy arrays to lists for JSON serialization
    return [encoding.tolist() for encoding in encodings]


def is_duplicate_face(new_encoding, current_uid: str, tolerance: float = 0.45) -> str | None:
    """
    Check if the given face encoding already exists for a different user.
    
    Args:
        new_encoding: Face encoding to check
        current_uid: Current user ID (skip when checking)
        tolerance: Face match tolerance threshold
    
    Returns:
        User ID if duplicate found, None otherwise
    """
    all_users = users_collection.find({
        "face_encodings": {"$exists": True, "$ne": None}
    })
    
    for user in all_users:
        existing_uid = user["user_id"]
        
        # Skip same user (re-registration check)
        if existing_uid == current_uid:
            continue
        
        existing_encodings = user.get("face_encodings", [])
        if not existing_encodings:
            continue
        
        # Convert list encodings back to numpy arrays for comparison
        existing_encodings_np = [np.array(enc) for enc in existing_encodings]
        
        # Compare faces
        matches = face_recognition.compare_faces(
            existing_encodings_np,
            new_encoding,
            tolerance=tolerance
        )
        
        if True in matches:
            return existing_uid  # Duplicate found
    
    return None


def get_known_faces_from_db():
    """
    Load all registered face encodings from MongoDB.
    
    Returns:
        Tuple of (known_encodings, known_ids)
        - known_encodings: List of numpy arrays
        - known_ids: Corresponding user IDs
    """
    known_encodings = []
    known_ids = []
    
    all_users = users_collection.find({
        "face_encodings": {"$exists": True, "$ne": None}
    })
    
    for user in all_users:
        encodings = user.get("face_encodings", [])
        if encodings:
            # Convert list encodings back to numpy arrays
            encodings_np = [np.array(enc) for enc in encodings]
            known_encodings.extend(encodings_np)
            known_ids.extend([user["user_id"]] * len(encodings_np))
    
    return known_encodings, known_ids
