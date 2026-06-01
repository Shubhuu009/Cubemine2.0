const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: function requirePassword() { return this.authProvider !== 'google'; },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String, default: null },
    totalSolves: { type: Number, default: 0 },
    bestTime2x2: { type: Number, default: null },
    bestTime3x3: { type: Number, default: null },
    bestTime4x4: { type: Number, default: null },
    bestTime5x5: { type: Number, default: null },
    preferences: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      showTimer: { type: Boolean, default: true },
      enableKeyboardShortcuts: { type: Boolean, default: true },
      enableNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.index({ totalSolves: -1 });
userSchema.index({ bestTime2x2: 1 });
userSchema.index({ bestTime3x3: 1 });
userSchema.index({ bestTime4x4: 1 });
userSchema.index({ bestTime5x5: 1 });

module.exports = mongoose.model('User', userSchema);
