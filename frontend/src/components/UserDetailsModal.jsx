import React from 'react';

export const UserDetailsModal = ({ isOpen, user, onClose }) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">User Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-2 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          {/* User ID and Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
              <p className="text-lg font-semibold text-gray-900">{user.user_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <p className="text-lg font-semibold text-gray-900">{user.name}</p>
            </div>
          </div>

          {/* Email and Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <p className="text-gray-700">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
              <p className="text-gray-700">{user.department}</p>
            </div>
          </div>

          {/* Role and Registration Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {user.role}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Created Date</label>
              <p className="text-gray-700">{formatDate(user.created_at)}</p>
            </div>
          </div>

          {/* Face Registration Status */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Face Registration</label>
            <div className="flex items-center gap-2">
              {user.face_registered_at ? (
                <>
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  <p className="text-gray-700">
                    Registered on {formatDate(user.face_registered_at)}
                  </p>
                </>
              ) : (
                <>
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                  <p className="text-gray-700">Not registered</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
