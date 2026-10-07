import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/reports`;

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("access_token") ||
    JSON.parse(localStorage.getItem("user") || "{}").access_token;

  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ------------------------------------
// Preview API Calls
// ------------------------------------

export const getFundingReport = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/funding`, {
    headers: getAuthHeaders(),
    params: filters
  });
  return response.data;
};

export const getPatentReport = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/patents`, {
    headers: getAuthHeaders(),
    params: filters
  });
  return response.data;
};

export const getResearchTrendReport = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/research-trends`, {
    headers: getAuthHeaders(),
    params: filters
  });
  return response.data;
};

export const getInnovationReport = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/innovation`, {
    headers: getAuthHeaders(),
    params: filters
  });
  return response.data;
};

export const getCommercializationReport = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/commercialization`, {
    headers: getAuthHeaders(),
    params: filters
  });
  return response.data;
};


// ------------------------------------
// File Export API Calls (Blob handling)
// ------------------------------------

export const exportPdfReport = async (exportParams) => {
  const response = await axios.post(`${API_URL}/export/pdf`, exportParams, {
    headers: getAuthHeaders(),
    responseType: "blob"
  });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${exportParams.report_type || "intelligence"}_report.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportExcelReport = async (exportParams) => {
  const response = await axios.post(`${API_URL}/export/excel`, exportParams, {
    headers: getAuthHeaders(),
    responseType: "blob"
  });

  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    })
  );
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${exportParams.report_type || "intelligence"}_report.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
