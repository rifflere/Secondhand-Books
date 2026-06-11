const usersRepo = require('../repositories/usersRepository');
const buddiesRepo = require('../repositories/buddiesRepository');
const shelvesService = require('../services/shelvesService');

const userShelves = async (req, res, next) => {
  try {
    const target = await usersRepo.findPublicByUsername(req.params.username);
    if (!target) return res.status(404).json({ error: 'User not found' });

    if (target.id !== req.user.id) {
      const friends = await buddiesRepo.areBuddies(req.user.id, target.id);
      if (!friends) return res.status(403).json({ error: 'Not book buddies' });
    }

    res.json(await shelvesService.getPublicShelves(target.id));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const userShelfBooks = async (req, res, next) => {
  try {
    const target = await usersRepo.findPublicByUsername(req.params.username);
    if (!target) return res.status(404).json({ error: 'User not found' });

    if (target.id !== req.user.id) {
      const friends = await buddiesRepo.areBuddies(req.user.id, target.id);
      if (!friends) return res.status(403).json({ error: 'Not book buddies' });
    }

    const books = await shelvesService.getPublicShelfBooks(
      target.id,
      parseInt(req.params.shelfId, 10),
      req.query.sort, req.query.dir
    );
    res.json(books);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

module.exports = { userShelves, userShelfBooks };
