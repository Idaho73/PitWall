// src/api/axiosInstance.ts
import axios from "axios";

// Same-origin -> Next API route-okat hívod (/api/...)
const api = axios.create({
  baseURL: "", // fontos: maradjon a frontend origin
});

// MINDEN request előtt rátesszük a JWT-t, ha van
api.interceptors.request.use((config) => {
  // client-only
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token"); // vagy ahol tárolod
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
