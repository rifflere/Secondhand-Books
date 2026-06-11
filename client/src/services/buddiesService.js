import api from './api';

export const searchUsers = (q) =>
  api.get('/buddies/search', { params: { q } }).then((r) => r.data);

export const sendBuddyRequest = (username) =>
  api.post('/buddies/request', { username }).then((r) => r.data);

export const respondToRequest = (id, action) =>
  api.patch(`/buddies/${id}`, { action });

export const listBuddies = () =>
  api.get('/buddies').then((r) => r.data);

export const listIncoming = () =>
  api.get('/buddies/requests/incoming').then((r) => r.data);

export const listOutgoing = () =>
  api.get('/buddies/requests/outgoing').then((r) => r.data);

export const removeBuddy = (id) => api.delete(`/buddies/${id}`);

export const getFeed = () =>
  api.get('/buddies/feed').then((r) => r.data);

export const getUserShelves = (username) =>
  api.get(`/users/${username}/shelves`).then((r) => r.data);

export const getUserShelfBooks = (username, shelfId, sort, dir) =>
  api.get(`/users/${username}/shelves/${shelfId}/books`, { params: { sort, dir } })
     .then((r) => r.data);
