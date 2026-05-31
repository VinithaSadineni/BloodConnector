import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('Missing VITE_API_URL. Set VITE_API_URL in .env or in your deployment environment to the deployed backend API URL.');
}

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
    let message = error.response?.data?.message || 'An unexpected error occurred';
    
    // If there are detailed validation errors, append the first one
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
      message = `${message}: ${error.response.data.errors[0].msg || error.response.data.errors[0].message}`;
    }
    
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
