const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { upload } = require('../middleware/upload');
const { uploadAvatar } = require('../controllers/uploadController');

router.post('/upload-avatar', requireAuth, upload.single('avatar'), uploadAvatar);

module.exports = router;
