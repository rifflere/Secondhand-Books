const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/recover', authController.recover);
router.get('/validate-token/:token', authController.validateResetToken);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
