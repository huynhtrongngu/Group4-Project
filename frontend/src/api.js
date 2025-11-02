import axios from 'axios';

const _envApi = process.env.REACT_APP_API_URL;
export const API_BASE = _envApi ? _envApi.replace(/\/$/, '') : (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '');

const api = axios.create({
  baseURL: API_BASE || undefined,
  withCredentials: true, // allow cookies for refresh flow
});

// Request: attach access token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let refreshing = null;

async function refreshToken() {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await api.post('/refresh');
        const newToken = res?.data?.token;
        if (newToken) {
          localStorage.setItem('token', newToken);
        }
        return newToken;
      } catch (e) {
        // Clear broken token
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        throw e;
      } finally {
        // small delay to prevent thundering herd
        setTimeout(() => { refreshing = null; }, 50);
      }
    })();
  }
  return refreshing;
}

// Response: on 401, try refresh once then retry original request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;
    if (status === 401 && !original?._retry) {
      original._retry = true;
      try {
        const newTok = await refreshToken();
        if (newTok) {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newTok}`;
          return api(original);
        }
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;
