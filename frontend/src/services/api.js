import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType") || "Bearer";

    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;