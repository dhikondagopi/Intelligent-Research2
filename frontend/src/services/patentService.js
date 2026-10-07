import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/patents`;

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