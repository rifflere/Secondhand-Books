import api from './api';

export const register = async (username, password) => {
  const { data } = await api.post('/auth/register', { username, password });
  return data;
};

export const login = async (username, password) => {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
};
