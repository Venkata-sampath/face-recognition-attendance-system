import React from 'react';

export const ProfileModal = ({ isOpen, onClose, user, onLogout }) => {
  if (!isOpen) return null;

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-8 flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center font-bold text-2xl text-blue-600">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-blue-100 text-sm">{user?.role === 'admin' ? 'Administrator' : 'Student'}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          {/* User ID */}
          <div className="border-b pb-4">
            <p className="text-xs font-medium text-gray-500 uppercase">User ID</p>
            <p className="text-lg font-semibold text-gray-900">{user?.user_id}</p>
          </div>

          {/* Email */}
          {user?.email && (
            <div className="border-b pb-4">
              <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
              <p className="text-gray-700">{user?.email}</p>
            </div>
          )}

          {/* Department/Course */}
          {user?.department && (
            <div className="border-b pb-4">
              <p className="text-xs font-medium text-gray-500 uppercase">Department</p>
              <p className="text-gray-700">{user?.department}</p>
            </div>
          )}

          {/* Role */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Role</p>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
              user?.role === 'admin'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user?.role === 'admin' ? 'Administrator' : 'Student'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
          >
            Close
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
