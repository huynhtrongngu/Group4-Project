const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

/**
 * Middleware xác thực JWT đơn giản dựa trên header Authorization: Bearer <token>
 * Nếu hợp lệ, gắn thông tin user vào req.user để các handler phía sau sử dụng.
 */
async function requireAuth(req, res, next) {
  try {
    const rawHeader = String(req.headers.authorization || '');
    const match = rawHeader.match(/^Bearer\s+(.+)$/i);
    const token = match ? match[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'Thiếu token xác thực' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      const message = err?.name === 'TokenExpiredError' ? 'Token đã hết hạn' : 'Token không hợp lệ';
      return res.status(401).json({ message });
    }

    const user = await User.findById(payload?.sub);
    if (!user) {
      return res.status(401).json({ message: 'Không tìm thấy user cho token đã cung cấp' });
    }

    req.auth = { token, payload };
    req.user = user;
    next();
  } catch (err) {
    console.error('[requireAuth] unexpected error', err);
    return res.status(500).json({ message: 'Lỗi xác thực', error: err.message });
  }
}

module.exports = requireAuth;
