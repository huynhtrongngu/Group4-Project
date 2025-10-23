/**
 * RBAC middleware helpers: requireAdmin and allowSelfOrAdmin
 * - requireAdmin: only allows users with role === 'admin'
 * - allowSelfOrAdmin: allows admin or the authenticated user matching :id
 */
function requireAdmin(req, res, next) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Yêu cầu xác thực' });
    if (String(user.role) !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền (chỉ admin)' });
    }
    return next();
  } catch (err) {
    console.error('[requireAdmin] error', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

function allowSelfOrAdmin(req, res, next) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Yêu cầu xác thực' });
    const targetId = String(req.params.id || '');
    if (String(user.role) === 'admin') return next();
    if (String(user._id) === targetId) return next();
    return res.status(403).json({ message: 'Không có quyền thực hiện thao tác này' });
  } catch (err) {
    console.error('[allowSelfOrAdmin] error', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { requireAdmin, allowSelfOrAdmin };
