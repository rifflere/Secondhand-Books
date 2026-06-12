jest.mock('../config/database', () => ({ query: jest.fn() }));

const request = require('supertest');
const app     = require('../index');
const pool    = require('../config/database');
const { token } = require('./helpers');

const AUTH = token({ id: 1, username: 'testuser' });

describe('GET /api/account/stats', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/account/stats');
    expect(res.status).toBe(401);
  });

  test('returns stats for current user', async () => {
    pool.query
      .mockResolvedValueOnce([[{ books: 12 }]])
      .mockResolvedValueOnce([[{ shelves: 3 }]])
      .mockResolvedValueOnce([[{ buddies: 5 }]])
      .mockResolvedValueOnce([[{ username: 'testuser', created_at: new Date('2025-01-01') }]]);
    const res = await request(app)
      .get('/api/account/stats')
      .set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(res.body.books).toBe(12);
    expect(res.body.shelves).toBe(3);
    expect(res.body.buddies).toBe(5);
    expect(res.body.username).toBe('testuser');
    expect(res.body.createdAt).toBeDefined();
  });
});

describe('DELETE /api/account', () => {
  test('requires authentication', async () => {
    const res = await request(app).delete('/api/account');
    expect(res.status).toBe(401);
  });

  test('deletes account and returns 204', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app)
      .delete('/api/account')
      .set('Authorization', AUTH);
    expect(res.status).toBe(204);
  });
});
