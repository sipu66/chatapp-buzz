// import axios from 'axios';

// export const axiosInstance = axios.create({
//   baseURL: import.meta.env.MODE === 'development'
//     ? 'http://localhost:4000/api/v1'
//     : 'https://your-backend.onrender.com/api/v1', // <-- Render backend URL
//   withCredentials: true,
// });

import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Uses the environment variable
  withCredentials: true,
});
