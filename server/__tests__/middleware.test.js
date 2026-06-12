jest.mock('../config/database', () => ({ query: jest.fn() }));

const request = require('supertest');
const app     = require('../index');
const { token, adminToken } = require('./helpers');

describe('authenticate middleware', () => {
  test('rejects request with no token', async () => {
    const res = await request(app).get('/api/shelves');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/authentication required/i);
  });

  test('rejects request with malformed token', async () => {
    const res = await request(app)
      .get('/api/shelves')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid or expired/i);
  });

  test('rejects Bearer with wrong secret', async () => {
    const jwt = require('jsonwebtoken');
    const bad = `Bearer ${jwt.sign({ id: 1 }, 'wrong-secret')}`;
    const res = await request(app).get('/api/shelves').set('Authorization', bad);
    expect(res.status).toBe(401);
  });

  test('passes valid token to route', async () => {
    const pool = require('../config/database');
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app)
      .get('/api/shelves')
      .set('Authorization', token());
    expect(res.status).toBe(200);
  });
});

describe('requireAdmin middleware', () => {
  test('rejects non-admin token with 403', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', token({ isAdmin: false }));
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/admin/i);
  });

  test('allows admin token', async () => {
    const pool = require('../config/database');
    pool.query.mockResolvedValueOnce([[]]); // findAll users
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', adminToken());
    expect(res.status).toBe(200);
  });

  test('returns 401 with no token on admin route', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });
});
