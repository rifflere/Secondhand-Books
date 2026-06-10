const openLibraryService = require('../services/openLibraryService');

const search = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const results = await openLibraryService.searchBooks(q.trim());
    res.json(results);
  } catch (err) {
    next(err);
  }
};

module.exports = { search };
