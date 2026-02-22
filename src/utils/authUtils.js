// src/utils/authUtils.js
// Helper functions to avoid duplicated code across components

/**
 * Extract authentication token from various server response shapes.
 * @param {object} response - Axios response object
 * @returns {string|null}
 */
export function extractToken(response) {
  return response?.data?.token
    || response?.data?.accessToken
    || response?.data?.data?.token
    || null;
}

/**
 * Pull publicId out of a response body using several common field names.
 * @param {object} response - Axios response
 * @returns {string|null}
 */
export function extractPublicId(response) {
  return response?.data?.publicId
    || response?.data?.public_id
    || response?.data?.data?.publicId
    || null;
}

/**
 * Normalize an error object into a human-readable message.
 * @param {any} err - Error thrown by axios or other code
 * @param {string} defaultMsg - fallback message
 * @returns {string}
 */
export function getErrorMessage(err, defaultMsg = 'Ошибка') {
  if (!err) return defaultMsg;
  if (typeof err === 'string') return err;
  const msg = err?.response?.data?.message || err?.message;
  return msg || defaultMsg;
}

/**
 * Simple logger that keeps a consistent prefix style.
 */
export function logError(err, prefix = '') {
  if (prefix) console.error(prefix, err);
  else console.error(err);
}
