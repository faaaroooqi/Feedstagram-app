import axios from "axios";

const API = axios.create({
   baseURL:import.meta.env.VITE_API_URL, // backend base URL
});

// Attach JWT token automatically if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
