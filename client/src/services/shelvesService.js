import api from './api';

export const listShelves = () => api.get('/shelves').then((r) => r.data);

export const createShelf = (name) =>
  api.post('/shelves', { name }).then((r) => r.data);

export const updateShelf = (id, updates) =>
  api.patch(`/shelves/${id}`, updates);

export const deleteShelf = (id) => api.delete(`/shelves/${id}`);

export const getShelfBooks = (id, sort, dir) =>
  api.get(`/shelves/${id}/books`, { params: { sort, dir } }).then((r) => r.data);

export const addBookToShelf = (shelfId, bookId) =>
  api.post(`/shelves/${shelfId}/books`, { bookId });

export const removeBookFromShelf = (shelfId, bookId) =>
  api.delete(`/shelves/${shelfId}/books/${bookId}`);
