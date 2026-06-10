const axios = require('axios');

const OPEN_LIBRARY_URL = 'https://openlibrary.org/search.json';

const searchBooks = async (searchTerm) => {
  const response = await axios.get(OPEN_LIBRARY_URL, {
    params: { title: searchTerm },
    timeout: 10000,
  });

  const { docs, numFound } = response.data;

  return {
    searchTerm,
    totalResults: numFound,
    books: (docs || []).map(normalizeBook),
  };
};

const normalizeBook = (doc) => {
  const coverId = doc.cover_i ?? null;
  return {
    olKey: doc.key || null,
    title: doc.title || null,
    author: doc.author_name?.[0] || null,
    year: doc.first_publish_year || null,
    cover: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null,
    pages: doc.number_of_pages_median || null,
  };
};

module.exports = { searchBooks };
