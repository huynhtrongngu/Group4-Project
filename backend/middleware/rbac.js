/**
 * RBAC middleware helpers
 * - requireAdmin: only allows users with role === 'admin'
 * - checkRole(...allowed): allow if user's role is in allowed list
 * - allowSelfOrAdmin: allows admin or the authenticated user matching :id
 * - allowSelfOrRoles(...roles): allows if user's role is in roles OR self matches :id
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

function checkRole(...allowed) {
  return function (req, res, next) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: 'Yêu cầu xác thực' });
      const role = String(user.role || '');
      if (!allowed.map(String).includes(role)) {
        return res.status(403).json({ message: 'Không có quyền' });
      }
      return next();
    } catch (err) {
      console.error('[checkRole] error', err);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };
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

function allowSelfOrRoles(...roles) {
  return function (req, res, next) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: 'Yêu cầu xác thực' });
      const targetId = String(req.params.id || '');
      if (roles.map(String).includes(String(user.role))) return next();
      if (String(user._id) === targetId) return next();
      return res.status(403).json({ message: 'Không có quyền thực hiện thao tác này' });
    } catch (err) {
      console.error('[allowSelfOrRoles] error', err);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };
}

module.exports = { requireAdmin, checkRole, allowSelfOrAdmin, allowSelfOrRoles };
