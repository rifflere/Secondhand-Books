import api from './api';

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

export const saveBook = async (book) => {
  const { data } = await api.post('/books', book);
  return data;
};

export const deleteBook = async (id) => {
  await api.delete(`/books/${id}`);
};
