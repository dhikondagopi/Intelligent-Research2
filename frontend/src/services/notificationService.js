import axios from "axios";
import { API_BASE_URL } from "./api";

const API_URL = `${API_BASE_URL}/api/notifications`;

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("access_token") ||
    JSON.parse(localStorage.getItem("user") || "{}").access_token;

  return token ? { Authorization: `Bearer ${token}` } : {};
};


// ------------------------------------
// Get Paginated Notifications
// ------------------------------------

export const getNotifications = async (
  type = "ALL",
  page = 1,
  limit = 20
) => {
  const params = { page, limit };
  if (type && type !== "ALL") {
    params.type = type;
  }

  const response = await axios.get(API_URL, {
    headers: getAuthHeaders(),
    params
  });

  return response.data;
};


// ------------------------------------
// Get Unread Notifications & Count
// ------------------------------------

export const getUnreadNotifications = async () => {
  const response = await axios.get(`${API_URL}/unread`, {
    headers: getAuthHeaders()
  });

  return response.data;
};


// ------------------------------------
// Get Single Notification
// ------------------------------------

export const getNotificationById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: getAuthHeaders()
  });

  return response.data;
};


// ------------------------------------
// Mark Single Notification as Read
// ------------------------------------

export const markNotificationAsRead = async (id) => {
  const response = await axios.patch(
    `${API_URL}/${id}/read`,
    {},
    {
      headers: getAuthHeaders()
    }
  );

  return response.data;
};


// ------------------------------------
// Mark All Notifications as Read
// ------------------------------------

export const markAllNotificationsAsRead = async () => {
  const response = await axios.patch(
    `${API_URL}/read-all`,
    {},
    {
      headers: getAuthHeaders()
    }
  );

  return response.data;
};


// ------------------------------------
// Trigger Alert Generation
// ------------------------------------

export const triggerAlertGeneration = async () => {
  const response = await axios.post(
    `${API_URL}/generate-alerts`,
    {},
    {
      headers: getAuthHeaders()
    }
  );

  return response.data;
};
