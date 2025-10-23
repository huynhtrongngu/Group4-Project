require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { sendMail } = require('../utils/email');

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
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
      createdAt: user.createdAt,
    };
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
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
    };
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
// --- Forgot/Reset Password ---
async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email là bắt buộc' });
    const normalized = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalized }).select('+resetPasswordTokenHash +resetPasswordExpiresAt');
    if (!user) {
      // Do not reveal existence of email
      return res.json({ message: 'Nếu email tồn tại, liên kết đặt lại đã được gửi.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;

    const subject = 'Đặt lại mật khẩu';
    const text = `Bạn đã yêu cầu đặt lại mật khẩu. Dùng mã sau hoặc mở liên kết trong vòng 60 phút.\n\nToken: ${token}\nLink: ${resetLink}`;
    const html = `<p>Bạn đã yêu cầu đặt lại mật khẩu.</p><p><strong>Token:</strong> ${token}</p><p><a href="${resetLink}">Nhấn để đặt lại mật khẩu</a> (hết hạn sau 60 phút)</p>`;

    try { await sendMail({ to: normalized, subject, text, html }); } catch (e) { console.warn('[sendMail] failed or dev fallback used:', e.message); }

    const devPayload = process.env.NODE_ENV !== 'production' ? { devToken: token } : {};
    return res.json({ message: 'Nếu email tồn tại, liên kết đặt lại đã được gửi.', ...devPayload });
  } catch (err) {
    console.error('[forgotPassword] error', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ message: 'token và password là bắt buộc' });
    if (String(password).length < 6) return res.status(400).json({ message: 'Mật khẩu phải tối thiểu 6 ký tự' });

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const now = new Date();
    const user = await User.findOne({ resetPasswordTokenHash: tokenHash, resetPasswordExpiresAt: { $gt: now } }).select('+passwordHash +resetPasswordTokenHash +resetPasswordExpiresAt');
    if (!user) return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });

    user.passwordHash = await bcrypt.hash(String(password), 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    return res.json({ message: 'Đổi mật khẩu thành công. Hãy đăng nhập lại.' });
  } catch (err) {
    console.error('[resetPassword] error', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
