import api from './axios';

// Attendance APIs
export const attendanceAPI = {
  getMyAttendance: async () => {
    const response = await api.get('/attendance/me');
    return response.data;
  },

  getAllAttendance: async () => {
    const response = await api.get('/attendance/all');
    return response.data;
  },

  getMySummary: async () => {
    const response = await api.get('/attendance/summary/me');
    return response.data;
  },

  getDailySummary: async (date) => {
    const response = await api.get(`/attendance/summary/day?date=${date}`);
    return response.data;
  }
};

// User APIs
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/users/all');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users/create', userData);
    return response.data;
  },

  registerFace: async (userId, imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.post(`/users/register-face/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Auth APIs
export const authAPI = {
  login: async (user_id, password) => {
    const response = await api.post(`/auth/login?user_id=${user_id}&password=${password}`);
    return response.data;
  }
};
