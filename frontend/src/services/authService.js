import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/auth`;

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);

  if (response.data && response.data.access_token) {
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("user", JSON.stringify({
      user_id: response.data.user_id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role
    }));
  }

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/**
 * Retrieves the Google OAuth authorization URL from backend.
 */
export const getGoogleAuthUrl = async () => {
  const frontendUrl = window.location.origin;
  const response = await axios.get(`${API_URL}/google/url`, {
    params: { frontend_url: frontendUrl }
  });
  return response.data;
};

/**
 * Initiates the Google OAuth 2.0 flow by fetching the stateful authorization
 * URL from the backend or redirecting directly to the initiate endpoint.
 */
export const initiateGoogleLogin = async () => {
  try {
    const data = await getGoogleAuthUrl();
    if (data && data.authorization_url) {
      window.location.href = data.authorization_url;
      return;
    }
  } catch (err) {
    console.warn("Could not retrieve authorization URL via JSON endpoint, falling back to direct redirect:", err);
  }
  const frontendUrl = encodeURIComponent(window.location.origin);
  window.location.href = `${API_BASE_URL}/auth/google/login?frontend_url=${frontendUrl}`;
};