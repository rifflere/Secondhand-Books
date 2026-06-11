const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const accountController = require('../controllers/accountController');

router.get('/stats', authenticate, accountController.getStats);
router.delete('/', authenticate, accountController.deleteAccount);

module.exports = router;
