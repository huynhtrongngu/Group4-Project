const bcrypt = require('bcryptjs');
const User = require('../models/User');

function sanitize(userDoc) {
  if (!userDoc) return null;
  return {
    _id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    phone: userDoc.phone || '',
    bio: userDoc.bio || '',
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
}

// GET /profile - trả về thông tin user đã đăng nhập
async function getProfile(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    return res.json({ user: sanitize(user) });
  } catch (err) {
    console.error('[getProfile] error', err);
    return res.status(500).json({ message: 'Không lấy được thông tin user', error: err.message });
  }
}

// PUT /profile - cập nhật tên, email, mật khẩu
async function updateProfile(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

  const { name, email, password, phone, bio } = req.body || {};
    const updates = {};

    if (typeof name === 'string' && name.trim()) {
      updates.name = name.trim();
    }

    if (typeof email === 'string') {
      const emailTrimmed = email.trim().toLowerCase();
      if (!emailTrimmed) {
        return res.status(400).json({ message: 'Email không được để trống' });
      }
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(emailTrimmed)) {
        return res.status(400).json({ message: 'Email không hợp lệ' });
      }
      updates.email = emailTrimmed;
    }

    if (typeof password === 'string') {
      const passwordTrimmed = password.trim();
      if (passwordTrimmed && passwordTrimmed.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải tối thiểu 6 ký tự' });
      }
      if (passwordTrimmed) {
        updates.passwordHash = await bcrypt.hash(passwordTrimmed, 10);
      }
    }

    if (typeof phone === 'string') {
      const phoneTrimmed = phone.trim();
      if (phoneTrimmed && !/^[+\d()\s-]{6,30}$/.test(phoneTrimmed)) {
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
      }
      updates.phone = phoneTrimmed || undefined;
    }

    if (typeof bio === 'string') {
      const bioTrimmed = bio.trim();
      if (bioTrimmed.length > 500) {
        return res.status(400).json({ message: 'Giới thiệu tối đa 500 ký tự' });
      }
      updates.bio = bioTrimmed || undefined;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'Không có dữ liệu nào để cập nhật' });
    }

    if (updates.email && updates.email !== user.email) {
      const duplicated = await User.findOne({ _id: { $ne: user._id }, email: updates.email }).lean();
      if (duplicated) {
        return res.status(409).json({ message: 'Email đã tồn tại' });
      }
      user.email = updates.email;
    }

    if (updates.name) {
      user.name = updates.name;
    }

    if (updates.passwordHash) {
      user.passwordHash = updates.passwordHash;
    }

    if ('phone' in updates) {
      user.phone = updates.phone;
    }

    if ('bio' in updates) {
      user.bio = updates.bio;
    }

    await user.save();

    return res.json({ message: 'Cập nhật thành công', user: sanitize(user) });
  } catch (err) {
    console.error('[updateProfile] error', err);
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }
    return res.status(500).json({ message: 'Không cập nhật được thông tin', error: err.message });
  }
}

module.exports = { getProfile, updateProfile };
