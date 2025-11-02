const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');
const { isAccessJtiRevoked } = require('./tokenBlacklist');

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
      payload = verifyAccessToken(token);
    } catch (err) {
      const message = err?.name === 'TokenExpiredError' ? 'Token đã hết hạn' : 'Token không hợp lệ';
      return res.status(401).json({ message });
    }

    if (isAccessJtiRevoked(payload?.jti)) {
      return res.status(401).json({ message: 'Token đã bị thu hồi' });
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
