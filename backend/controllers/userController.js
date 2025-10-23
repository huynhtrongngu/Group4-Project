const User = require('../models/User');

// Chỉ gửi những trường cần thiết ra ngoài
function sanitize(userDoc) {
  if (!userDoc) return null;
  const { _id, name, email, role, createdAt, updatedAt } = userDoc;
  return {
    _id: typeof _id === 'string' ? _id : _id?.toString(),
    name,
    email,
    role,
    phone: userDoc.phone || '',
    bio: userDoc.bio || '',
    avatarUrl: userDoc.avatarUrl || '',
    createdAt,
    updatedAt,
  };
}

// GET /users - lấy danh sách người dùng
async function getUsers(req, res) {
  try {
    const users = await User.find()
      .select('name email role avatarUrl createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();
    return res.json(users.map(sanitize));
  } catch (err) {
    console.error('[getUsers] error', err);
    return res.status(500).json({ message: 'Không lấy được danh sách users', error: err.message });
  }
}

// POST /users - thêm người dùng mới
async function createUser(req, res) {
  try {
  const { name, email, role, phone, bio } = req.body || {};
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!trimmedName || !trimmedEmail) {
      return res.status(400).json({ message: 'Name và email là bắt buộc' });
    }

    const exists = await User.findOne({ email: trimmedEmail }).lean();
    if (exists) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }

    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      role: role === 'admin' ? 'admin' : 'user',
    };

    if (typeof phone === 'string' && phone.trim()) {
      payload.phone = phone.trim();
    }

    if (typeof bio === 'string' && bio.trim()) {
      payload.bio = bio.trim();
    }

    const user = await User.create(payload);

    return res.status(201).json({ message: 'Tạo user thành công', user: sanitize(user) });
  } catch (err) {
    console.error('[createUser] error', err);
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }
    return res.status(500).json({ message: 'Không tạo được user', error: err.message });
  }
}

// PUT /users/:id - cập nhật user
async function updateUser(req, res) {
  try {
  const { id } = req.params;
  const { name, email, role, phone, bio } = req.body || {};

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    if (typeof name === 'string') {
      const trimmedName = name.trim();
      if (trimmedName) user.name = trimmedName;
    }

    if (typeof email === 'string') {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) {
        return res.status(400).json({ message: 'Email không được để trống' });
      }
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ message: 'Email không hợp lệ' });
      }
      if (trimmedEmail !== user.email) {
        const duplicated = await User.findOne({ _id: { $ne: user._id }, email: trimmedEmail }).lean();
        if (duplicated) {
          return res.status(409).json({ message: 'Email đã tồn tại' });
        }
        user.email = trimmedEmail;
      }
    }

    if (typeof role === 'string' && ['admin', 'user'].includes(role)) {
      user.role = role;
    }

    if (typeof phone === 'string') {
      const phoneTrimmed = phone.trim();
      if (phoneTrimmed && !/^[+\d()\s-]{6,30}$/.test(phoneTrimmed)) {
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
      }
      user.phone = phoneTrimmed || undefined;
    }

    if (typeof bio === 'string') {
      const bioTrimmed = bio.trim();
      if (bioTrimmed.length > 500) {
        return res.status(400).json({ message: 'Giới thiệu tối đa 500 ký tự' });
      }
      user.bio = bioTrimmed || undefined;
    }

    await user.save();

    return res.json({ message: 'Cập nhật user thành công', user: sanitize(user) });
  } catch (err) {
    console.error('[updateUser] error', err);
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }
    return res.status(500).json({ message: 'Không cập nhật được user', error: err.message });
  }
}

// DELETE /users/:id - xóa user
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }
    return res.json({ message: 'Xóa user thành công' });
  } catch (err) {
    console.error('[deleteUser] error', err);
    return res.status(500).json({ message: 'Không xóa được user', error: err.message });
  }
}

module.exports = { getUsers, createUser, updateUser, deleteUser };
