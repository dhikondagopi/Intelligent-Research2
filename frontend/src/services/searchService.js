import axios from "axios";
import { API_BASE_URL } from "./api";

/**
 * Execute unified global search across research, patents, funding, technologies,
 * organizations, and researchers.
 *
 * @param {string} query - Search term
 * @param {string} [category="all"] - Optional filter category
 * @param {number} [page=1] - Page number
 * @param {number} [perPage=20] - Results per page
 */
export const globalSearch = async (query, category = "all", page = 1, perPage = 20) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.get(`${API_BASE_URL}/api/search`, {
    params: {
      q: query,
      type: category,
      page,
      per_page: perPage,
    },
    headers,
  });

  return response.data;
};

export default {
  globalSearch,
};
