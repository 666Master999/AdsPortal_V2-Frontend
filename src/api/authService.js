///src/api/authService.js
import { apiClient } from './apiClient';

export function registerUser(payload) {
  return apiClient.post('/api/auth/register', payload);
}

export function loginUser(payload) {
  return apiClient.post('/api/auth/login', payload);
}
