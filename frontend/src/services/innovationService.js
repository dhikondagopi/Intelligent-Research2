import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/innovation`;

export const getInnovationDashboard = async (signal) => {
  const response = await axios.get(
    `${API_URL}/dashboard`,
    { signal }
  );

  return response.data;
};

export const getInnovationScore = async (technology, signal) => {
  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(technology)}`,
    { signal }
  );

  return response.data;
};