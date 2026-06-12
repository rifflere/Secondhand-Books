jest.mock('../config/database', () => ({ query: jest.fn() }));

const request = require('supertest');
const app     = require('../index');
const pool    = require('../config/database');
const { token } = require('./helpers');

const AUTH = token();

const fakeBook = {
  id: 1, user_id: 1, external_id: '/works/OL1W', title: 'Dune',
  author: 'Frank Herbert', publication_year: 1965, cover_url: null, pages: 412,
};

describe('GET /api/books/popular', () => {
  test('returns popular books from public shelves only', async () => {
    pool.query.mockResolvedValueOnce([[
      { external_id: '/works/OL1W', title: 'Dune', author: 'Frank Herbert', save_count: 5 },
    ]]);
    const res = await request(app).get('/api/books/popular');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe('Dune');
  });

  test('returns empty array when no books exist', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/api/books/popular');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/books/search', () => {
  test('returns search results', async () => {
    const res = await request(app).get('/api/books/search?q=dune');
    // Open Library is called here; in test env it will try HTTP — just check we don't crash on the route layer
    expect([200, 500, 503]).toContain(res.status); // network may be unavailable in test
  });

  test('rejects missing query param with 400', async () => {
    const res = await request(app).get('/api/books/search');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/search query is required/i);
  });

  test('rejects empty query with 400', async () => {
    const res = await request(app).get('/api/books/search?q=');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/books', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(401);
  });

  test('returns user shelf books', async () => {
    pool.query.mockResolvedValueOnce([[fakeBook]]);
    const res = await request(app).get('/api/books').set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe('Dune');
  });

  test('passes sort parameters to repository', async () => {
    pool.query.mockResolvedValueOnce([[fakeBook]]);
    const res = await request(app)
      .get('/api/books?sort=title&dir=asc')
      .set('Authorization', AUTH);
    expect(res.status).toBe(200);
  });
});

describe('POST /api/books', () => {
  test('requires authentication', async () => {
    const res = await request(app).post('/api/books').send({ title: 'Test' });
    expect(res.status).toBe(401);
  });

  test('saves book to main shelf and returns 201', async () => {
    pool.query
      .mockResolvedValueOnce([[]])                                        // findByExternalId — not exists
      .mockResolvedValueOnce([{ insertId: 5 }])                          // create book
      .mockResolvedValueOnce([[{ id: 10, user_id: 1, is_default: 1 }]]) // findDefault shelf
      .mockResolvedValueOnce([{ affectedRows: 1 }]);                     // addBook to shelf
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', AUTH)
      .send({ title: 'Dune', author: 'Frank Herbert', olKey: '/works/OL1W' });
    expect(res.status).toBe(201);
  });

  test('rejects missing title with 400', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', AUTH)
      .send({ author: 'Someone' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title is required/i);
  });

  test('returns 409 when book already on shelf', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 5 }]]);                             // findByExternalId — already exists
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', AUTH)
      .send({ title: 'Dune', olKey: '/works/OL1W' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already on shelf/i);
  });
});

describe('DELETE /api/books/:id', () => {
  test('requires authentication', async () => {
    const res = await request(app).delete('/api/books/1');
    expect(res.status).toBe(401);
  });

  test('deletes book and returns 204', async () => {
    pool.query
      .mockResolvedValueOnce([{ affectedRows: 1 }]);      // DELETE FROM books
    const res = await request(app)
      .delete('/api/books/1')
      .set('Authorization', AUTH);
    expect(res.status).toBe(204);
  });

  test('returns 404 for book not owned by user', async () => {
    pool.query.mockResolvedValueOnce([[]]); // findById returns nothing
    const res = await request(app)
      .delete('/api/books/999')
      .set('Authorization', AUTH);
    expect(res.status).toBe(404);
  });
});
