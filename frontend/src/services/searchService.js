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
 * @param {string} [mode="all"] - Search mode: all (hybrid), keyword, semantic
 */
export const globalSearch = async (
  query,
  category = "all",
  page = 1,
  perPage = 20,
  mode = "all"
) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.get(`${API_BASE_URL}/api/search`, {
    params: {
      q: query,
      type: category,
      mode,
      page,
      per_page: perPage,
    },
    headers,
  });

  return response.data;
};

/**
 * Execute dedicated semantic vector similarity search via SentenceTransformers + FAISS.
 *
 * @param {string} query - Conceptual query
 * @param {number} [page=1]
 * @param {number} [perPage=20]
 * @param {number} [threshold=0.12]
 */
export const semanticSearch = async (
  query,
  page = 1,
  perPage = 20,
  threshold = 0.12
) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.get(`${API_BASE_URL}/api/search/semantic`, {
    params: {
      q: query,
      page,
      per_page: perPage,
      threshold,
    },
    headers,
  });

  return response.data;
};

export default {
  globalSearch,
  semanticSearch,
};
