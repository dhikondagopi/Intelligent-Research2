import axios from "axios";

const API_URL =
  "http://127.0.0.1:8000/api/profile";


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