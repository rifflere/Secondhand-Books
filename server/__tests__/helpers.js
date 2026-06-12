require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production';

const token = (overrides = {}) =>
  `Bearer ${jwt.sign({ id: 1, username: 'testuser', isAdmin: false, ...overrides }, SECRET)}`;

const adminToken = () => token({ id: 99, username: 'adminuser', isAdmin: true });

// Shorthand mock return values
const emptyRows   = [[]];
const insertId1   = [{ insertId: 1 }];
const affected1   = [{ affectedRows: 1 }];
const affected0   = [{ affectedRows: 0 }];

module.exports = { token, adminToken, emptyRows, insertId1, affected1, affected0 };
