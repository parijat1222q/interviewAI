import api from './client';

/**
 * Register a new user
 * @param {Object} credentials - { email, password, role }
 * @returns {Promise<Object>} - { token, user }
 */
export const register = async (credentials) => {
  const response = await api.post('/auth/register', credentials);
  return response.data;
};

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { token, user }
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Logout user (clears token)
 */
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

/**
 * Get current user's token
 * @returns {string|null}
 */
export const getToken = () => localStorage.getItem('token');

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Simple token expiry check (basic)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};