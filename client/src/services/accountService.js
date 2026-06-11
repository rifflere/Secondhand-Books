import api from './api';

export const getAccountStats = async () => {
  const { data } = await api.get('/account/stats');
  return data;
};

export const deleteAccount = async () => {
  await api.delete('/account');
};
