const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    cubeType: {
      type: String,
      enum: ['2x2', '3x3', '4x4', '5x5', 'general'],
      default: 'general',
    },
    title: { type: String, trim: true, maxlength: 100 },
    body: { type: String, required: true, minlength: 10, maxlength: 1000 },
    helpfulVotes: { type: Number, default: 0 },
    helpfulVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per user
reviewSchema.index({ userId: 1 }, { unique: true });
reviewSchema.index({ cubeType: 1, createdAt: -1 });
reviewSchema.index({ helpfulVotes: -1 });
reviewSchema.index({ rating: -1 });

module.exports = mongoose.model('Review', reviewSchema);
