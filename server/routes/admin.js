const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');
const ctrl = require('../controllers/adminController');

router.use(authenticate, requireAdmin);

router.get('/users',            ctrl.listUsers);
router.get('/shelves',          ctrl.listShelves);
router.patch('/users/:id/admin', ctrl.setAdmin);
router.delete('/users/:id',     ctrl.deleteUser);

module.exports = router;
