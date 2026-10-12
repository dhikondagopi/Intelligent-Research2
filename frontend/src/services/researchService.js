import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/research`;

export const searchResearch = async (query, page = 1, perPage = 15) => {
  const response = await axios.get(`${API_URL}/search`, {
    params: {
      q: query,
      page,
      per_page: perPage,
    },
  });

  return response.data;
};

export const getTrendingResearch = async () => {
  const response = await axios.get(`${API_URL}/trending`);
  return response.data;
};

export const getResearchById = async (researchId) => {
  const response = await axios.get(`${API_URL}/${encodeURIComponent(researchId)}`);
  return response.data;
};

export const getRelatedResearch = async (workId, limit = 6) => {
  const response = await axios.get(`${API_URL}/related`, {
    params: {
      work_id: workId,
      limit,
    },
  });
  return response.data;
};

export const getResearchTrends = async (params = {}) => {
  const response = await axios.get(`${API_URL}/trends`, { params });
  return response.data;
};

export const getEmergingTopics = async (params = {}) => {
  const response = await axios.get(`${API_URL}/trends/emerging`, { params });
  return response.data;
};

export const getResearchHotspots = async (params = {}) => {
  const response = await axios.get(`${API_URL}/trends/hotspots`, { params });
  return response.data;
};

export const getTopicAnalytics = async (topic, limit = 10) => {
  const response = await axios.get(`${API_URL}/trends/topics/${encodeURIComponent(topic)}`, {
    params: { limit },
  });
  return response.data;
};

export default {
  searchResearch,
  getTrendingResearch,
  getResearchById,
  getRelatedResearch,
  getResearchTrends,
  getEmergingTopics,
  getResearchHotspots,
  getTopicAnalytics,
};