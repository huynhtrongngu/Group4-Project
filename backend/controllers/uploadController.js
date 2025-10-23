const fs = require('fs');
const path = require('path');
const User = require('../models/User');

async function uploadAvatar(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (!req.file) return res.status(400).json({ message: 'Thiếu file ảnh (field name: avatar)' });

    // Build public URL path relative to server root
    const filename = path.basename(req.file.filename);
    const urlPath = `/uploads/avatars/${filename}`;

    // Remove previous local avatar if exists
    if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/')) {
      const oldFsPath = path.join(__dirname, '..', user.avatarUrl.replace(/^\//, ''));
      try { fs.unlinkSync(oldFsPath); } catch {}
    }

    user.avatarUrl = urlPath;
    user.avatarPublicId = filename; // optional: store local filename
    await user.save();

    return res.json({ message: 'Cập nhật avatar thành công', avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error('[uploadAvatar] error', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

module.exports = { uploadAvatar };
