jest.mock('../config/database', () => ({ query: jest.fn() }));

const request    = require('supertest');
const app        = require('../index');
const pool       = require('../config/database');
const { token, adminToken } = require('./helpers');

const ADMIN = adminToken();           // id: 99, isAdmin: true
const USER  = token({ id: 1 });      // id: 1,  isAdmin: false

const fakeUser  = { id: 1, username: 'alice', created_at: new Date(), is_admin: 0, book_count: 5, shelf_count: 2 };
const fakeShelf = { id: 10, name: 'Main Shelf', is_default: 1, owner_username: 'alice', book_count: 5, created_at: new Date() };

describe('GET /api/admin/users', () => {
  test('requires admin token', async () => {
    const res = await request(app).get('/api/admin/users').set('Authorization', USER);
    expect(res.status).toBe(403);
  });

  test('returns all users with stats', async () => {
    pool.query.mockResolvedValueOnce([[fakeUser, { ...fakeUser, id: 2, username: 'bob' }]]);
    const res = await request(app).get('/api/admin/users').set('Authorization', ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].username).toBe('alice');
  });
});

describe('GET /api/admin/shelves', () => {
  test('requires admin token', async () => {
    const res = await request(app).get('/api/admin/shelves').set('Authorization', USER);
    expect(res.status).toBe(403);
  });

  test('returns all public shelves', async () => {
    pool.query.mockResolvedValueOnce([[fakeShelf]]);
    const res = await request(app).get('/api/admin/shelves').set('Authorization', ADMIN);
    expect(res.status).toBe(200);
    expect(res.body[0].owner_username).toBe('alice');
  });
});

describe('PATCH /api/admin/users/:id/admin', () => {
  test('grants admin to a user', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app)
      .patch('/api/admin/users/1/admin')
      .set('Authorization', ADMIN)
      .send({ isAdmin: true });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('revokes admin from a user', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app)
      .patch('/api/admin/users/1/admin')
      .set('Authorization', ADMIN)
      .send({ isAdmin: false });
    expect(res.status).toBe(200);
  });

  test('rejects non-boolean isAdmin with 400', async () => {
    const res = await request(app)
      .patch('/api/admin/users/1/admin')
      .set('Authorization', ADMIN)
      .send({ isAdmin: 'yes' });
    expect(res.status).toBe(400);
  });

  test('requires admin token', async () => {
    const res = await request(app)
      .patch('/api/admin/users/1/admin')
      .set('Authorization', USER)
      .send({ isAdmin: true });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/admin/users/:id', () => {
  test('deletes a user', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app)
      .delete('/api/admin/users/1')
      .set('Authorization', ADMIN);
    expect(res.status).toBe(204);
  });

  test('prevents admin from deleting themselves', async () => {
    // adminToken has id: 99
    const res = await request(app)
      .delete('/api/admin/users/99')
      .set('Authorization', ADMIN);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cannot delete your own/i);
  });

  test('requires admin token', async () => {
    const res = await request(app)
      .delete('/api/admin/users/1')
      .set('Authorization', USER);
    expect(res.status).toBe(403);
  });
});
