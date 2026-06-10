import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const searchBooks = async (query) => {
  const { data } = await api.get('/books/search', { params: { q: query } });
  return data;
};
