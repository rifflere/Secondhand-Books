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
    CREATE TABLE IF NOT EXISTS books (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      external_id     VARCHAR(255) UNIQUE,
      title           VARCHAR(500) NOT NULL,
      author          VARCHAR(255),
      publication_year INT,
      cover_url       TEXT,
      pages           INT,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      "\n  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';" +
      '\n  FLUSH PRIVILEGES;' +
      '\nThen re-run: npm run db:init'
    );
  }
  process.exit(1);
});
