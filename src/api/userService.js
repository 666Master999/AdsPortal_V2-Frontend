///src/api/userService.js
import { apiClient } from './apiClient';

export function fetchMyProfile(opts = {}) {
  return apiClient.get('/api/users/me', opts);
}

export function fetchUserProfile(id, opts = {}) {
  return apiClient.get(`/api/users/${id}`, opts);
}
