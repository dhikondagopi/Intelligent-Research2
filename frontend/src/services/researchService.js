import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/research";

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