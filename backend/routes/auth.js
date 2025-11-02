const express = require('express');
const router = express.Router();
const { signup, login, logout, forgotPassword, resetPassword, refresh } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/auth/refresh', refresh); // alias for clarity
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
