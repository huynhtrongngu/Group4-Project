require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Reuse the database service by connecting to the same MongoDB here (simple setup)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/group4_project';
const DB_NAME = process.env.DB_NAME || 'groupDB';
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(MONGODB_URI, { dbName: DB_NAME })
    .then(() => console.log(`✅ [backend] MongoDB connected (db: ${DB_NAME})`))
    .catch((err) => console.error('❌ [backend] MongoDB connection error:', err.message));
}

// Import the User model from the database folder
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// POST /signup
async function signup(req, res) {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password là bắt buộc' });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() }).lean();
    if (exists) return res.status(409).json({ message: 'Email đã tồn tại' });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({ name, email, passwordHash, role: role === 'admin' ? 'admin' : 'user' });

    // Do not include passwordHash in response
    const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
    return res.status(201).json({ message: 'Đăng ký thành công', user: safeUser });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: 'Email đã tồn tại' });
    console.error('[signup] error', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

// POST /login
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email và password là bắt buộc' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    const ok = await bcrypt.compare(String(password), user.passwordHash || '');
    if (!ok) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role };
    return res.json({ message: 'Đăng nhập thành công', token, user: safeUser });
  } catch (err) {
    console.error('[login] error', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

// POST /logout (stateless JWT: instruct client to delete token)
async function logout(req, res) {
  // In a real app, consider token blacklist. For now, client should remove token.
  return res.json({ message: 'Đăng xuất thành công. Hãy xóa token ở phía client.' });
}

module.exports = { signup, login, logout };
