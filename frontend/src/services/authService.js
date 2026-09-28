import API from "./api";

const API_AUTH_URL = "/api/auth";

export const login = async (email, password) => {
  const response = await API.post(`${API_AUTH_URL}/login`, { email, password });
  const data = response.data;

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("tokenType", data.type || "Bearer");
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);
  }

  return data;
};

export const register = async (registerData) => {
  // Sends RegisterRequest payload: { firstName, lastName, email, mobile, password }
  console.log(registerData)
  const response = await API.post(`${API_AUTH_URL}/register`, registerData);
  return response.data; // Returns RegisterResponse: { id, firstName, email, message }
};

export const logout = () => {
  localStorage.clear();
};

export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  return {
    token,
    userId: localStorage.getItem("userId"),
    email: localStorage.getItem("email"),
    role: localStorage.getItem("role"),
  };
};

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
};

export default authService;