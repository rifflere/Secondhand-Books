import api from './api';

export const getAdminUsers   = async () => { const { data } = await api.get('/admin/users');   return data; };
export const getAdminShelves = async () => { const { data } = await api.get('/admin/shelves'); return data; };

export const setUserAdmin = async (userId, isAdmin) => {
  const { data } = await api.patch(`/admin/users/${userId}/admin`, { isAdmin });
  return data;
};

export const adminDeleteUser = async (userId) => {
  await api.delete(`/admin/users/${userId}`);
};
