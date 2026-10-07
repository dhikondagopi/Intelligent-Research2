import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/v1/commercialization`;


export const getCommercializationDashboard = async (
  technology
) => {

  const response = await axios.get(
    `${API_URL}/dashboard/${encodeURIComponent(
      technology
    )}`
  );

  return response.data;
};


export const getCommercializationAnalysis = async (
  technology
) => {

  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(
      technology
    )}`
  );

  return response.data;
};


export const getProductization = async (
  technology
) => {

  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(
      technology
    )}/productization`
  );

  return response.data;
};


export const getLicensing = async (
  technology
) => {

  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(
      technology
    )}/licensing`
  );

  return response.data;
};


export const getStartupCreation = async (
  technology
) => {

  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(
      technology
    )}/startup`
  );

  return response.data;
};


export const getIndustryPartnerships = async (
  technology
) => {

  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(
      technology
    )}/partnerships`
  );

  return response.data;
};