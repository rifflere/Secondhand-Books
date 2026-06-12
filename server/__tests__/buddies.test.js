jest.mock('../config/database', () => ({ query: jest.fn() }));

const request = require('supertest');
const app     = require('../index');
const pool    = require('../config/database');
const { token } = require('./helpers');

const AUTH = token({ id: 1, username: 'alice' });

describe('GET /api/buddies/search', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/buddies/search?q=bob');
    expect(res.status).toBe(401);
  });

  test('returns search results with relationship status', async () => {
    pool.query.mockResolvedValueOnce([[
      { id: 2, username: 'bob', friendship_id: null, friendship_status: null, direction: null },
    ]]);
    const res = await request(app)
      .get('/api/buddies/search?q=bob')
      .set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(res.body[0].username).toBe('bob');
  });

  test('rejects missing query with 400', async () => {
    const res = await request(app)
      .get('/api/buddies/search')
      .set('Authorization', AUTH);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/buddies/feed', () => {
  test('returns activity feed', async () => {
    pool.query.mockResolvedValueOnce([[
      { id: 1, title: 'Dune', username: 'bob', shelf_name: 'Main Shelf', activity_at: new Date() },
    ]]);
    const res = await request(app)
      .get('/api/buddies/feed')
      .set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/buddies/requests/incoming', () => {
  test('returns incoming requests', async () => {
    pool.query.mockResolvedValueOnce([[
      { id: 5, from_username: 'carol', from_user_id: 3, created_at: new Date() },
    ]]);
    const res = await request(app)
      .get('/api/buddies/requests/incoming')
      .set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(res.body[0].from_username).toBe('carol');
  });
});

describe('GET /api/buddies', () => {
  test('returns accepted buddies list', async () => {
    pool.query.mockResolvedValueOnce([[
      { id: 2, username: 'bob', friendship_id: 5, friends_since: new Date() },
    ]]);
    const res = await request(app)
      .get('/api/buddies')
      .set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(res.body[0].username).toBe('bob');
  });
});

describe('POST /api/buddies/request', () => {
  test('sends a buddy request', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 2, username: 'bob' }]])    // findPublicByUsername
      .mockResolvedValueOnce([[]])                               // findRequest — none exists
      .mockResolvedValueOnce([[]])                               // reverse request — none
      .mockResolvedValueOnce([{ insertId: 10 }]);               // createRequest
    const res = await request(app)
      .post('/api/buddies/request')
      .set('Authorization', AUTH)
      .send({ username: 'bob' });
    expect(res.status).toBe(201);
  });

  test('returns 404 for unknown user', async () => {
    pool.query.mockResolvedValueOnce([[]]); // user not found
    const res = await request(app)
      .post('/api/buddies/request')
      .set('Authorization', AUTH)
      .send({ username: 'nobody' });
    expect(res.status).toBe(404);
  });

  test('returns 400 when sending request to self', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, username: 'alice' }]]); // findPublicByUsername
    const res = await request(app)
      .post('/api/buddies/request')
      .set('Authorization', AUTH)
      .send({ username: 'alice' }); // same id as token user
    expect(res.status).toBe(400);
  });

  test('rejects missing username with 400', async () => {
    const res = await request(app)
      .post('/api/buddies/request')
      .set('Authorization', AUTH)
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/buddies/:id', () => {
  test('accepts a request', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 5, receiver_id: 1, status: 'pending' }]]) // findById
      .mockResolvedValueOnce([{ affectedRows: 1 }]);                           // updateRequest
    const res = await request(app)
      .patch('/api/buddies/5')
      .set('Authorization', AUTH)
      .send({ action: 'accept' });
    expect(res.status).toBe(204);
  });

  test('returns 403 if not the receiver', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 5, receiver_id: 99, status: 'pending' }]]);
    const res = await request(app)
      .patch('/api/buddies/5')
      .set('Authorization', AUTH)
      .send({ action: 'accept' });
    expect(res.status).toBe(403);
  });

  test('rejects invalid action with 400', async () => {
    const res = await request(app)
      .patch('/api/buddies/5')
      .set('Authorization', AUTH)
      .send({ action: 'banana' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/buddies/:id', () => {
  test('removes a buddy', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app)
      .delete('/api/buddies/5')
      .set('Authorization', AUTH);
    expect(res.status).toBe(204);
  });

  test('returns 404 if friendship not found', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app)
      .delete('/api/buddies/999')
      .set('Authorization', AUTH);
    expect(res.status).toBe(404);
  });
});
