///src/config/apiConfig.js
export const TOKEN_KEY = 'auth_token';
export const DEFAULT_DEV_API = 'https://localhost:7145';
export const DEFAULT_PROD_API = 'https://adportal.runasp.net/';
export const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? DEFAULT_DEV_API : DEFAULT_PROD_API);
