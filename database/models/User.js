const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true,
             match: [/^\S+@\S+\.\S+$/, 'Invalid email'] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
