import axios from "axios";

export const BASE_URLS = {
  AUTH: "http://localhost:8081",
  HEALTH: "http://localhost:8082",
  CONSULT: "http://localhost:8083",
  PRESCRIPTION: "http://localhost:8084",
  NOTIFICATION: "http://localhost:8085",
};

// Default axios client (AUTH)
const axiosClient = axios.create({
  baseURL: BASE_URLS.AUTH,
});

// Request interceptor
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("id");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (userId) config.headers["X-User-Id"] = userId;

  return config;
});

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("id");

      const role = localStorage.getItem("userRole");
      if (role === "PATIENT") window.location.href = "/patient/login";
      else if (role === "DOCTOR") window.location.href = "/doctor/login";
      else if (role === "ADMIN") window.location.href = "/admin/login";
      else window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;