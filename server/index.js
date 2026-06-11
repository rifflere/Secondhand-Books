require('dotenv').config();
const express = require('express');
const cors = require('cors');
const booksRouter = require('./routes/books');
const authRouter = require('./routes/auth');
const shelvesRouter = require('./routes/shelves');
const buddiesRouter = require('./routes/buddies');
const usersRouter = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/shelves', shelvesRouter);
app.use('/api/buddies', buddiesRouter);
app.use('/api/users', usersRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
