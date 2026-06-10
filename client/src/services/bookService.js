import api from './api';

export const searchBooks = async (query) => {
  const { data } = await api.get('/books/search', { params: { q: query } });
  return data;
};

export const getShelf = async (sort) => {
  const { data } = await api.get('/books', { params: sort ? { sort } : {} });
  return data;
};

export const saveBook = async (book) => {
  const { data } = await api.post('/books', book);
  return data;
};

export const deleteBook = async (id) => {
  await api.delete(`/books/${id}`);
};
