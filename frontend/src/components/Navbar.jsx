import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ProfileModal } from './ProfileModal';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">FA</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Face Attendance</span>
            </div>

            {/* Right Side - User Menu */}
            <div className="flex items-center gap-4">
              {/* Role Badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAdmin 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {isAdmin ? 'Admin' : 'Student'}
              </span>

              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>

              {/* Profile Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfile(true);
                    setShowMenu(false);
                  }}
                  className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center font-bold transition"
                  title="View Profile"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </button>
              </div>

              {/* Menu Button (Mobile) */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMenu && (
            <div className="sm:hidden pb-4 space-y-2 border-t pt-4">
              <button
                onClick={() => {
                  setShowProfile(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                👤 View Profile
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          user={user}
          onLogout={logout}
        />
      )}
    </>
  );
};
