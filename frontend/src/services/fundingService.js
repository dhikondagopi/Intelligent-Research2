import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/funding";


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