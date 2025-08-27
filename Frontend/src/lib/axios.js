  import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL 
                 || (import.meta.env.MODE === 'development'
                     ? 'http://localhost:4000/api/v1'
                     : 'https://chatapp-buzz.onrender.com/api/v1');

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
