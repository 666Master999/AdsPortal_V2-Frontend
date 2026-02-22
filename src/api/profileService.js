///src/api/profileService.js
import { apiClient } from './apiClient';

/**
 * Fetch own profile (only for authenticated users)
 */
export function fetchMyProfile(opts = {}) {
  return apiClient.get('/api/users/profile', opts);
}

/**
 * Fetch public profile by numeric ID (viewable by anyone)
 */
export function fetchUserProfile(id, opts = {}) {
  return apiClient.get(`/api/users/profiles/${id}`, opts);
}

/**
 * Update own profile fields (name, email, phone, etc.)
 */
export function updateProfile(data) {
  return apiClient.put('/api/users/profile', data);
}

/**
 * Change password for authenticated user
 */
export function changePassword(data) {
  return apiClient.post('/api/users/profile/change-password', data);
}

/**
 * Upload avatar image for authenticated user
 * @param {File} imageFile - The image file to upload
 * @returns {Promise} Response with { avatarUrl: "/uploads/avatars/{file}.jpg" }
 */
export function uploadAvatar(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  return apiClient.post('/api/users/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
