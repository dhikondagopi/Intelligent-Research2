import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/funding`;


// ------------------------------------
// Search Funding
// ------------------------------------

export const searchFunding = async (
  query,
  page = 1,
  limit = 10
) => {
  const response = await axios.get(
    `${API_URL}/search`,
    {
      params: {
        q: query,
        page,
        limit
      }
    }
  );

  return response.data;
};


// ------------------------------------
// Funding Statistics
// ------------------------------------

export const getFundingStatistics = async () => {
  const response = await axios.get(
    `${API_URL}/statistics`
  );

  return response.data;
};


// ------------------------------------
// Top Organizations
// ------------------------------------

export const getTopOrganizations = async () => {
  const response = await axios.get(
    `${API_URL}/top-organizations`
  );

  return response.data;
};


// ------------------------------------
// Single Funding Project
// ------------------------------------

export const getFundingProject = async (
  applicationId
) => {
  const response = await axios.get(
    `${API_URL}/${applicationId}`
  );

  return response.data;
};