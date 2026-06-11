const accountService = require('../services/accountService');

const getStats = async (req, res, next) => {
  try {
    const stats = await accountService.getStats(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await accountService.deleteAccount(req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, deleteAccount };
