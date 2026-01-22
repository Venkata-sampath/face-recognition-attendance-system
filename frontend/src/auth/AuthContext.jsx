import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/users/me");
      setUser(response.data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      localStorage.removeItem("access_token");
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (user_id, password) => {
    try {
      setError(null);
      const response = await api.post(`/auth/login?user_id=${user_id}&password=${password}`);
      const { access_token } = response.data;
      localStorage.setItem("access_token", access_token);

      // Fetch user profile
      const meRes = await api.get("/users/me");
      setUser(meRes.data);

      // Redirect based on role
      if (meRes.data.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/student-dashboard");
      }

      return meRes.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Login failed";
      setError(errorMsg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
