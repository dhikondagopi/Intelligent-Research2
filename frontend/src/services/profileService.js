import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/profile`;


// ------------------------------------
// Get Research Profile
// ------------------------------------

export const getProfile = async (userId) => {
  const response = await axios.get(
    `${API_URL}/${userId}`
  );

  return response.data;
};


// ------------------------------------
// Update Research Profile
// ------------------------------------

export const updateProfile = async (
  userId,
  profileData
) => {
  const response = await axios.put(
    `${API_URL}/${userId}`,
    profileData
  );

  return response.data;
};