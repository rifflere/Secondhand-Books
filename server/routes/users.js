const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const ctrl = require('../controllers/usersController');

router.get('/:username/shelves', authenticate, ctrl.userShelves);
router.get('/:username/shelves/:shelfId/books', authenticate, ctrl.userShelfBooks);

module.exports = router;
