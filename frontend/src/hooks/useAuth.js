import { useState, useEffect } from 'react';
import { login, register, logout, isAuthenticated } from '../api/auth';

/**
 * Hook for authentication state and actions
 * @returns {Object} - { user, loading, error, handleLogin, handleRegister, handleLogout }
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing auth state on mount
    if (isAuthenticated()) {
      const token = localStorage.getItem('token');
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.userId, email: payload.email });
      } catch {
        logout();
      }
    }
  }, []);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await login(credentials);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await register(credentials);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
  };
};