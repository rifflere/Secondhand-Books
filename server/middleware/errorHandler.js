const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.response) {
    return res.status(502).json({ error: 'Open Library is currently unavailable' });
  }

  if (err.code === 'ECONNABORTED') {
    return res.status(504).json({ error: 'Open Library request timed out' });
  }

  res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;
