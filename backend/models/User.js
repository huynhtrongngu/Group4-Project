const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
    },
    passwordHash: { type: String, select: false },
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    phone: { type: String, trim: true, maxlength: 30 },
    bio: { type: String, trim: true, maxlength: 500 },
    // Avatar fields
    avatarUrl: { type: String, trim: true },
    avatarPublicId: { type: String, trim: true },
    // Password reset
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpiresAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
