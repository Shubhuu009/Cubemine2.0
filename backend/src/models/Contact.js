const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    topic: {
      type: String,
      required: true,
      enum: ['Bug Report', 'Feature Request', 'Account Issue', 'Solver Problem', 'General Question', 'Feedback / Review', 'Other'],
    },
    message: { type: String, required: true, minlength: 20, maxlength: 2000 },
    status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
