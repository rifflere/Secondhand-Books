import api from './api';

export const getPopularBooks = async () => {
  const { data } = await api.get('/books/popular');
  return data;
};

export const searchBooks = async (query) => {
  const { data } = await api.get('/books/search', { params: { q: query } });
  return data;
};

export const getShelf = async (sort, dir) => {
  const params = {};
  if (sort) params.sort = sort;
  if (dir) params.dir = dir;
  const { data } = await api.get('/books', { params });
  return data;
};

export const saveBook = async (book, shelfId) => {
  const { data } = await api.post('/books', { ...book, shelfId: shelfId ?? undefined });
  return data;
};

export const deleteBook = async (id) => {
  await api.delete(`/books/${id}`);
};
