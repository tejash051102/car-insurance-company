import axios from "axios";
import { getAuthUser, getCustomerUser } from "../utils/authStorage.js";

const API_PREFIX = "/api";
const DEFAULT_API_URL = import.meta.env.PROD
  ? "https://car-insurance-backend-bxnz.onrender.com/api"
  : "/api";

const getApiBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
  const trimmedUrl = rawUrl.trim().replace(/\/+$/, "");

  return trimmedUrl.endsWith(API_PREFIX)
    ? trimmedUrl.slice(0, -API_PREFIX.length)
    : trimmedUrl;
};

const withApiPrefix = (url = "") => {
  if (!url || /^https?:\/\//i.test(url) || url.startsWith(API_PREFIX)) {
    return url;
  }

  return `${API_PREFIX}${url.startsWith("/") ? url : `/${url}`}`;
};

const api = axios.create({
  baseURL: getApiBaseUrl()
});

export const getAssetUrl = (path = "") => {
  if (!path || /^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

api.interceptors.request.use((config) => {
  config.url = withApiPrefix(config.url);

  const isCustomerPortalRequest = config.url?.startsWith("/api/customer-portal") || config.url?.startsWith("/customer-portal");
  const userInfo = isCustomerPortalRequest ? getCustomerUser() : getAuthUser();

  if (userInfo) {
    const { token } = userInfo;
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
