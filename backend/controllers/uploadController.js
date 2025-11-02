const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const streamifier = require('streamifier');
const cloudinary = require('../utils/cloudinary');
const User = require('../models/User');

async function uploadAvatar(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (!req.file) return res.status(400).json({ message: 'Thiếu file ảnh (field name: avatar)' });

    // 1) Process image with Sharp: square 256x256, WEBP for smaller size
    const processed = await sharp(req.file.buffer)
      .rotate() // respect EXIF orientation
      .resize(256, 256, { fit: 'cover', position: 'center' })
      .toFormat('webp', { quality: 85 })
      .toBuffer();

    // 2) Upload to Cloudinary via upload_stream
    const folder = process.env.CLOUDINARY_AVATAR_FOLDER || 'group4_project/avatars';
    const publicIdBase = `user_${String(user._id)}_${Date.now()}`;

    const uploadToCloudinary = () => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder,
          public_id: publicIdBase,
          overwrite: true,
          format: 'webp',
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
      streamifier.createReadStream(processed).pipe(stream);
    });

    const result = await uploadToCloudinary();
    const secureUrl = result?.secure_url;
    const publicId = result?.public_id;
    if (!secureUrl || !publicId) {
      return res.status(500).json({ message: 'Upload Cloudinary thất bại' });
    }

    // 3) Cleanup previous avatar (Cloudinary or local legacy)
    try {
      if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/')) {
        const oldFsPath = path.join(__dirname, '..', user.avatarUrl.replace(/^\//, ''));
        try { fs.unlinkSync(oldFsPath); } catch {}
      } else if (user.avatarPublicId) {
        // Best-effort delete on Cloudinary
        try { await cloudinary.uploader.destroy(user.avatarPublicId, { resource_type: 'image' }); } catch {}
      }
    } catch {}

    // 4) Save to user
    user.avatarUrl = secureUrl;
    user.avatarPublicId = publicId;
    await user.save();

    return res.json({ message: 'Cập nhật avatar thành công', avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error('[uploadAvatar] error', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

module.exports = { uploadAvatar };
