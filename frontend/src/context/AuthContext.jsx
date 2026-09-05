import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const needsProfileCompletion = (user) => {
  if (!user) return false;

  const isGoogleUser = Boolean(user.googleId) || user.provider === 'google';
  if (!isGoogleUser) return false;

  const hasPhone = !!user.phone && String(user.phone).trim();
  const hasAddress = !!(
    user.address &&
    user.address.street &&
    user.address.city &&
    user.address.state &&
    user.address.country &&
    user.address.zipCode
  );

  return !hasPhone || !hasAddress;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api
        .get('/auth/me')
        .then((res) => setUser(res.data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [token]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    toast.success('Logged out');
  };

  const value = { user, token, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);