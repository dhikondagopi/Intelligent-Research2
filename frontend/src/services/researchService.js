import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/research`;

export const searchResearch = async (query) => {
  const response = await axios.get(`${API_URL}/search`, {
    params: {
      q: query,
    },
  });

  return response.data;
};

export const getTrendingResearch = async () => {
  const response = await axios.get(`${API_URL}/trending`);
  return response.data;
};

export const getResearchById = async (researchId) => {
  const response = await axios.get(`${API_URL}/${researchId}`);
  return response.data;
};