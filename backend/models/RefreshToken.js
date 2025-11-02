const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    ip: { type: String },
    userAgent: { type: String },
  isRevoked: { type: Boolean, default: false, index: true },
  replacedByTokenHash: { type: String },
  expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete expired docs
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
