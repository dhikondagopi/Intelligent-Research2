import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/patents";

export const searchPatents = async (
  query,
  page = 1,
  size = 20
) => {
  const response = await axios.get(
    `${API_URL}/search`,
    {
      params: {
        q: query,
        page,
        size
      }
    }
  );

  return response.data;
};

export const getPatentStatistics = async () => {
  const response = await axios.get(
    `${API_URL}/statistics`
  );

  return response.data;
};

export const getPatent = async (patentId) => {
  const response = await axios.get(
    `${API_URL}/${patentId}`
  );

  return response.data;
};