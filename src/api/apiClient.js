///src/api/apiClient.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? 'https://localhost:7145' : 'https://adportal.runasp.net/');

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});
