import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/innovation`;

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