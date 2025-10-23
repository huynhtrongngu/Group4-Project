const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure upload directory exists
const uploadRoot = path.join(__dirname, '..', 'uploads');
const avatarDir = path.join(uploadRoot, 'avatars');
try { fs.mkdirSync(avatarDir, { recursive: true }); } catch {}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeBase = (path.basename(file.originalname || 'avatar', ext).replace(/[^a-z0-9_-]/gi, '_') || 'avatar');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${safeBase}-${unique}${ext || '.png'}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|gif|webp|svg\+xml)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Chỉ chấp nhận file ảnh'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

module.exports = { upload, uploadRoot, avatarDir };
