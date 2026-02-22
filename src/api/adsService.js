// src/api/adsService.js
import { apiClient } from './apiClient';

/**
 * Create a new ad with optional image
 * @param {Object} data - Ad data
 * @param {string} data.type - "Sell" or "Buy"
 * @param {string} data.title - Ad title
 * @param {string} [data.description] - Optional description
 * @param {number} data.price - Price
 * @param {File} [data.image] - Optional image file
 * @returns {Promise} Response with AdDto and imageUrl
 */
export function createAd(data) {
  const formData = new FormData();
  formData.append('Type', data.type);
  formData.append('Title', data.title);
  if (data.description) {
    formData.append('Description', data.description);
  }
  formData.append('Price', data.price);
  if (data.image) {
    formData.append('image', data.image);
  }

  return apiClient.post('/api/ads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

/**
 * Fetch all ads (with optional filters)
 */
export function fetchAds(opts = {}) {
  return apiClient.get('/api/ads', opts);
}

/**
 * Fetch single ad by ID
 */
export function fetchAd(id, opts = {}) {
  return apiClient.get(`/api/ads/${id}`, opts);
}

/**
 * Delete ad (only owner can delete)
 */
export function deleteAd(id) {
  return apiClient.delete(`/api/ads/${id}`);
}

/**
 * Update ad (only owner can update)
 */
export function updateAd(id, data) {
  const formData = new FormData();
  if (data.type) formData.append('Type', data.type);
  if (data.title) formData.append('Title', data.title);
  if (data.description !== undefined) {
    formData.append('Description', data.description);
  }
  if (data.price) formData.append('Price', data.price);
  if (data.image) {
    formData.append('image', data.image);
  }

  return apiClient.put(`/api/ads/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
