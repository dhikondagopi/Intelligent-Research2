import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/technology";

// Technology Dashboard
export const getTechnologyDashboard = async () => {
  const response = await axios.get(`${API_URL}/dashboard`);
  return response.data;
};

// Emerging Technologies
export const getEmergingTechnologies = async () => {
  const response = await axios.get(`${API_URL}/emerging`);
  return response.data;
};

// Technology Details
export const getTechnologyDetails = async (technology) => {
  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(technology)}`
  );
  return response.data;
};

// Technology Maturity
export const getTechnologyMaturity = async (technology) => {
  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(technology)}/maturity`
  );
  return response.data;
};

// Technology Adoption
export const getTechnologyAdoption = async (technology) => {
  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(technology)}/adoption`
  );
  return response.data;
};

// Innovation Opportunities
export const getTechnologyOpportunities = async (technology) => {
  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(technology)}/opportunities`
  );
  return response.data;
};

// Competitive Technology Monitoring
export const getTechnologyCompetitors = async (technology) => {
  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(technology)}/competitors`
  );
  return response.data;
};