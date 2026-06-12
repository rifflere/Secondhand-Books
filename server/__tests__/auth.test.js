jest.mock('../config/database', () => ({ query: jest.fn() }));
jest.mock('../services/emailService', () => ({
  sendUsernameReminder: jest.fn().mockResolvedValue(undefined),
  sendPasswordReset:    jest.fn().mockResolvedValue(undefined),
}));

const request  = require('supertest');
const app      = require('../index');
const pool     = require('../config/database');
const bcrypt   = require('bcryptjs');

let hashedPassword;
beforeAll(async () => {
  hashedPassword = await bcrypt.hash('password123', 10);
});

describe('POST /api/auth/register', () => {
  test('creates account and returns token', async () => {
    pool.query
      .mockResolvedValueOnce([[]])          // findByUsername — no conflict
      .mockResolvedValueOnce([[]])          // findByEmail — no conflict
      .mockResolvedValueOnce([{ insertId: 1 }]) // insert user
      .mockResolvedValueOnce([{ insertId: 2 }]); // createDefault shelf
    const res = await request(app).post('/api/auth/register').send({
      username: 'newuser', password: 'password123', email: 'new@example.com',
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ token: expect.any(String), user: { username: 'newuser', isAdmin: false } });
  });

  test('rejects duplicate username with 409', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, username: 'existing' }]]);
    const res = await request(app).post('/api/auth/register').send({
      username: 'existing', password: 'password123', email: 'other@example.com',
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/username already taken/i);
  });

  test('rejects duplicate email with 409', async () => {
    pool.query
      .mockResolvedValueOnce([[]])                          // username OK
      .mockResolvedValueOnce([[{ id: 2, email: 'dup@example.com' }]]); // email taken
    const res = await request(app).post('/api/auth/register').send({
      username: 'uniqueuser', password: 'password123', email: 'dup@example.com',
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email already exists/i);
  });

  test('rejects missing email with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'u', password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email is required/i);
  });

  test('rejects invalid email format with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'u', password: 'password123', email: 'not-an-email',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/valid email/i);
  });

  test('rejects short password with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'u', password: 'abc', email: 'x@x.com',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least 6/i);
  });

  test('rejects missing username with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      password: 'password123', email: 'x@x.com',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  test('returns token for valid credentials', async () => {
    pool.query.mockResolvedValueOnce([[{
      id: 1, username: 'testuser', password_hash: hashedPassword, is_admin: 0,
    }]]);
    const res = await request(app).post('/api/auth/login').send({
      username: 'testuser', password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('testuser');
  });

  test('returns isAdmin: true for admin users', async () => {
    pool.query.mockResolvedValueOnce([[{
      id: 9, username: 'admin', password_hash: hashedPassword, is_admin: 1,
    }]]);
    const res = await request(app).post('/api/auth/login').send({
      username: 'admin', password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.user.isAdmin).toBe(true);
  });

  test('rejects wrong password with 401', async () => {
    pool.query.mockResolvedValueOnce([[{
      id: 1, username: 'testuser', password_hash: hashedPassword, is_admin: 0,
    }]]);
    const res = await request(app).post('/api/auth/login').send({
      username: 'testuser', password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid username or password/i);
  });

  test('rejects unknown user with 401', async () => {
    pool.query.mockResolvedValueOnce([[]]); // no user found
    const res = await request(app).post('/api/auth/login').send({
      username: 'nobody', password: 'password123',
    });
    expect(res.status).toBe(401);
  });

  test('rejects missing fields with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'u' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/recover', () => {
  test('always returns generic success for username recovery', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, email: 'x@x.com', username: 'u' }]]);
    const res = await request(app).post('/api/auth/recover').send({
      type: 'username', email: 'x@x.com',
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('returns same generic message even if email not found', async () => {
    pool.query.mockResolvedValueOnce([[]]); // no user
    const res = await request(app).post('/api/auth/recover').send({
      type: 'username', email: 'nobody@example.com',
    });
    expect(res.status).toBe(200); // never reveals whether email exists
    expect(res.body.message).toBeDefined();
  });

  test('rejects missing email with 400', async () => {
    const res = await request(app).post('/api/auth/recover').send({ type: 'username' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/validate-token/:token', () => {
  test('returns valid: true for a valid token', async () => {
    pool.query.mockResolvedValueOnce([[{
      id: 1, token: 'abc', user_id: 1, expires_at: new Date(Date.now() + 3600000),
    }]]);
    const res = await request(app).get('/api/auth/validate-token/abc');
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
  });

  test('returns 400 for expired/invalid token', async () => {
    pool.query.mockResolvedValueOnce([[]]); // no valid token found
    const res = await request(app).get('/api/auth/validate-token/expired');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/reset-password', () => {
  test('resets password with valid token', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1, user_id: 2, token: 'tok' }]]) // findValid
      .mockResolvedValueOnce([{ affectedRows: 1 }])                    // updatePassword
      .mockResolvedValueOnce([{ affectedRows: 1 }]);                   // markUsed
    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'tok', password: 'newpassword',
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('rejects invalid token with 400', async () => {
    pool.query.mockResolvedValueOnce([[]]); // no valid token
    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'bad', password: 'newpassword',
    });
    expect(res.status).toBe(400);
  });

  test('rejects short password with 400', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'tok', password: 'abc',
    });
    expect(res.status).toBe(400);
  });
});
