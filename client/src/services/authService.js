import api from './api';

export const register = async (username, password, email) => {
  const { data } = await api.post('/auth/register', { username, password, email });
  return data;
};

export const login = async (username, password) => {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
};

export const recoverAccount = async (type, email, username) => {
  const { data } = await api.post('/auth/recover', { type, email, username });
  return data;
};

export const validateResetToken = async (token) => {
  const { data } = await api.get(`/auth/validate-token/${token}`);
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data;
};
