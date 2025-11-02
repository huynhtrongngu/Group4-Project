// Simple in-memory blacklist for access token JTIs
// Note: This will reset on server restart. For production, store in Redis or DB with TTL.
const revokedJtis = new Map(); // jti -> expiresAt (Date)

function revokeAccessJti(jti, expiresAt) {
  if (!jti) return;
  revokedJtis.set(jti, expiresAt instanceof Date ? expiresAt : new Date(expiresAt));
}

function isAccessJtiRevoked(jti) {
  if (!jti) return false;
  const exp = revokedJtis.get(jti);
  if (!exp) return false;
  if (Date.now() > exp.getTime()) {
    revokedJtis.delete(jti);
    return false;
  }
  return true;
}

// Optional periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [jti, exp] of revokedJtis.entries()) {
    if (now > exp.getTime()) revokedJtis.delete(jti);
  }
}, 5 * 60 * 1000).unref?.();

module.exports = { revokeAccessJti, isAccessJtiRevoked };
