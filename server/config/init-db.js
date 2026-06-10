require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function init() {
  const dbName = process.env.DB_NAME || 'secondhand_books';

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await conn.query(`USE \`${dbName}\``);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      username      VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrate books table if it exists without user_id
  const [cols] = await conn.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'books' AND COLUMN_NAME = 'user_id'`,
    [dbName]
  );
  if (cols.length === 0) {
    const [existing] = await conn.query(
      `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'books'`,
      [dbName]
    );
    if (existing[0].n > 0) {
      console.log('Migrating books table to support user accounts (existing shelf data will be cleared)...');
      await conn.query('DROP TABLE books');
    }
  }

  await conn.query(`
    CREATE TABLE IF NOT EXISTS books (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      user_id          INT NOT NULL,
      external_id      VARCHAR(255),
      title            VARCHAR(500) NOT NULL,
      author           VARCHAR(255),
      publication_year INT,
      cover_url        TEXT,
      pages            INT,
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_book (user_id, external_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log(`Database "${dbName}" initialized successfully.`);
  await conn.end();
}

init().catch((err) => {
  console.error('Failed to initialize database:', err.message);
  if (err.message.includes('unknown plugin') || err.message.includes('auth_gssapi_client')) {
    console.error(
      '\nFix: mysql2 does not support the auth plugin your MySQL user is configured with.' +
      '\nRun this in MySQL to switch to a supported auth method:' +
      "\n  ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('');" +
      '\n  FLUSH PRIVILEGES;' +
      '\nThen re-run: npm run db:init'
    );
  }
  process.exit(1);
});
