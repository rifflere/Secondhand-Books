const adminService = require('../services/adminService');

const listUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (err) { next(err); }
};

const listShelves = async (req, res, next) => {
  try {
    const shelves = await adminService.getAllPublicShelves();
    res.json(shelves);
  } catch (err) { next(err); }
};

const setAdmin = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    const { isAdmin } = req.body;
    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ error: 'isAdmin must be a boolean' });
    }
    await adminService.grantAdmin(targetId, isAdmin);
    res.json({ success: true });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    await adminService.deleteUser(req.user.id, targetId);
    res.status(204).send();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

module.exports = { listUsers, listShelves, setAdmin, deleteUser };
