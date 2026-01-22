import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { userAPI } from '../api/api';
import { toast } from 'react-toastify';

export const StudentRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: form, 2: face capture
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [faceImage, setFaceImage] = useState(null);
  const webcamRef = useRef(null);

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setFaceImage(imageSrc);
      toast.success('Face captured! Click "Proceed" to continue.');
    } else {
      toast.error('Failed to capture face. Please try again.');
    }
  }, []);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_id.trim()) newErrors.user_id = 'User ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.department.trim()) newErrors.department = 'Department is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToFace = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setStep(2);
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleRegisterStudent = async () => {
    if (!faceImage) {
      toast.error('Please capture a face photo');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create user
      await userAPI.createUser({
        user_id: formData.user_id,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department
      });

      // Step 2: Register face
      const imageFile = dataURLtoFile(faceImage, `${formData.user_id}-face.jpg`);
      await userAPI.registerFace(formData.user_id, imageFile);

      toast.success('Student registered successfully with face!');
      
      // Reset and close
      setFormData({
        user_id: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: ''
      });
      setFaceImage(null);
      setStep(1);
      onClose();
      onSuccess?.();

    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Registration failed';
      toast.error(errorMsg);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      user_id: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: ''
    });
    setFaceImage(null);
    setErrors({});
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {step === 1 ? 'Register New Student' : 'Capture Face'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-blue-700 rounded-full p-2 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {step === 1 ? (
            // Form Step
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID / Roll No *
                  </label>
                  <input
                    type="text"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    placeholder="E.g., 2024001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {errors.user_id && <p className="text-red-600 text-sm mt-1">{errors.user_id}</p>}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="E.g., Computer Science"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProceedToFace}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                >
                  Continue to Face Capture →
                </button>
              </div>
            </form>
          ) : (
            // Face Capture Step
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>📷 Face Capture:</strong> Please look directly at the camera and ensure your face is clearly visible in the frame.
                </p>
              </div>

              {faceImage ? (
                <div className="space-y-4">
                  <div className="border-2 border-green-500 rounded-lg overflow-hidden bg-gray-100">
                    <img src={faceImage} alt="Captured face" className="w-full" />
                  </div>
                  <button
                    onClick={() => setFaceImage(null)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Retake Photo
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full"
                  />
                </div>
              )}

              {!faceImage && (
                <button
                  onClick={capturePhoto}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                >
                  📸 Capture Face
                </button>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  ← Back
                </button>
                <button
                  onClick={handleRegisterStudent}
                  disabled={!faceImage || loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {loading ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
