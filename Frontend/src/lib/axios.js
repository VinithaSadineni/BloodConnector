import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Capture API errors and 401 Unauthenticated codes
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    
    if (error.response?.status === 401) {
      // Clear token and notify the store/app
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch event to allow stores to react
      window.dispatchEvent(new Event('auth-logout'));
      
      toast.error('Session expired or unauthorized. Logging out...');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } else {
      // Standard error toast
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
