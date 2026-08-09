import axios from 'axios';

// Uses Vercel environment variable in production.
// Falls back to localhost when running locally.
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
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

// API error logging
api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error(
      'API Error:',
      error.response?.status,
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;