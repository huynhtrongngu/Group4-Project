const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Keep local folders for backward-compat/static hosting (not used for new uploads to Cloudinary)
const uploadRoot = path.join(__dirname, '..', 'uploads');
const avatarDir = path.join(uploadRoot, 'avatars');
try { fs.mkdirSync(avatarDir, { recursive: true }); } catch {}

// Use memory storage so we can process with Sharp before uploading to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|gif|webp|svg\+xml)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Chỉ chấp nhận file ảnh'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

module.exports = { upload, uploadRoot, avatarDir };
