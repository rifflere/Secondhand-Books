jest.mock('../config/database', () => ({ query: jest.fn() }));

const request = require('supertest');
const app     = require('../index');
const pool    = require('../config/database');
const { token } = require('./helpers');

const AUTH  = token();
const AUTH2 = token({ id: 2, username: 'otheruser' });

const fakeShelf = { id: 10, user_id: 1, name: 'My Shelf', is_public: 1, is_default: 0, book_count: 3 };
const fakeBook  = { id: 5, user_id: 1, title: 'Dune', author: 'Frank Herbert' };

describe('GET /api/shelves', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/shelves');
    expect(res.status).toBe(401);
  });

  test('returns list of shelves for user', async () => {
    pool.query.mockResolvedValueOnce([[fakeShelf]]);
    const res = await request(app).get('/api/shelves').set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('My Shelf');
  });
});

describe('POST /api/shelves', () => {
  test('creates a new shelf', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 11 }]);
    const res = await request(app)
      .post('/api/shelves')
      .set('Authorization', AUTH)
      .send({ name: 'Reading List' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(11);
    expect(res.body.name).toBe('Reading List');
  });

  test('rejects missing name with 400', async () => {
    const res = await request(app)
      .post('/api/shelves')
      .set('Authorization', AUTH)
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/shelves/:id', () => {
  test('renames shelf', async () => {
    pool.query
      .mockResolvedValueOnce([[{ ...fakeShelf }]])  // findById
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // update
    const res = await request(app)
      .patch('/api/shelves/10')
      .set('Authorization', AUTH)
      .send({ name: 'Renamed Shelf' });
    expect(res.status).toBe(204);
  });

  test('returns 404 for shelf not owned by user', async () => {
    pool.query.mockResolvedValueOnce([[{ ...fakeShelf, user_id: 2 }]]); // belongs to other user
    const res = await request(app)
      .patch('/api/shelves/10')
      .set('Authorization', AUTH)
      .send({ name: 'Nope' });
    expect(res.status).toBe(404);
  });

  test('returns 404 for non-existent shelf', async () => {
    pool.query.mockResolvedValueOnce([[]]); // shelf not found
    const res = await request(app)
      .patch('/api/shelves/999')
      .set('Authorization', AUTH)
      .send({ name: 'Nope' });
    expect(res.status).toBe(404);
  });

  test('toggles shelf visibility', async () => {
    pool.query
      .mockResolvedValueOnce([[{ ...fakeShelf }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app)
      .patch('/api/shelves/10')
      .set('Authorization', AUTH)
      .send({ isPublic: false });
    expect(res.status).toBe(204);
  });
});

describe('DELETE /api/shelves/:id', () => {
  test('deletes shelf and orphan books', async () => {
    pool.query
      .mockResolvedValueOnce([[{ ...fakeShelf }]])   // findById
      .mockResolvedValueOnce([{ affectedRows: 1 }])  // remove shelf
      .mockResolvedValueOnce([{ affectedRows: 0 }]); // deleteOrphans
    const res = await request(app)
      .delete('/api/shelves/10')
      .set('Authorization', AUTH);
    expect(res.status).toBe(204);
  });

  test('cannot delete default shelf', async () => {
    pool.query.mockResolvedValueOnce([[{ ...fakeShelf, is_default: 1 }]]);
    const res = await request(app)
      .delete('/api/shelves/10')
      .set('Authorization', AUTH);
    expect(res.status).toBe(403);
  });

  test('returns 404 for non-existent shelf', async () => {
    pool.query.mockResolvedValueOnce([[]]); // not found
    const res = await request(app)
      .delete('/api/shelves/999')
      .set('Authorization', AUTH);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/shelves/:id/books', () => {
  test('returns books on shelf', async () => {
    pool.query
      .mockResolvedValueOnce([[{ ...fakeShelf }]])  // findById to verify ownership
      .mockResolvedValueOnce([[{ ...fakeBook, shelf_added_at: new Date() }]]);
    const res = await request(app)
      .get('/api/shelves/10/books')
      .set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe('Dune');
  });
});

describe('POST /api/shelves/:id/books', () => {
  test('adds book to shelf', async () => {
    pool.query
      .mockResolvedValueOnce([[{ ...fakeShelf }]])   // findById
      .mockResolvedValueOnce([[{ ...fakeBook }]])    // findBookById
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // addBook (INSERT IGNORE)
    const res = await request(app)
      .post('/api/shelves/10/books')
      .set('Authorization', AUTH)
      .send({ bookId: 5 });
    expect(res.status).toBe(201);
  });

  test('returns 409 if book already on shelf', async () => {
    pool.query
      .mockResolvedValueOnce([[{ ...fakeShelf }]])
      .mockResolvedValueOnce([[{ ...fakeBook }]])
      .mockResolvedValueOnce([{ affectedRows: 0 }]); // INSERT IGNORE did nothing
    const res = await request(app)
      .post('/api/shelves/10/books')
      .set('Authorization', AUTH)
      .send({ bookId: 5 });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/shelves/:id/books/:bookId', () => {
  test('removes book from shelf', async () => {
    pool.query
      .mockResolvedValueOnce([[{ ...fakeShelf }]])   // findById
      .mockResolvedValueOnce([{ affectedRows: 1 }])  // removeBook
      .mockResolvedValueOnce([[{ n: 0 }]])            // countBookShelves — 0 remaining
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // remove orphan book
    const res = await request(app)
      .delete('/api/shelves/10/books/5')
      .set('Authorization', AUTH);
    expect(res.status).toBe(204);
  });
});
