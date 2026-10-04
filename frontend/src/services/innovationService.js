import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/innovation";

export const getInnovationDashboard = async () => {
  const response = await axios.get(
    `${API_URL}/dashboard`
  );

  return response.data;
};

export const getInnovationScore = async (technology) => {
  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(technology)}`
  );

  return response.data;
};