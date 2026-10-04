import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/dashboard";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  return {
    Authorization: `Bearer ${token}`,
  };
};


export const getMyDashboard = async () => {
  const response = await axios.get(
    `${API_URL}/me`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};


export const getRoleDashboard = async (role) => {
  const response = await axios.get(
    `${API_URL}/${role}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};