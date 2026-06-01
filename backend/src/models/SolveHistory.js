const mongoose = require('mongoose');


const solveHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    cubeType: {
      type: String,
      enum: ['2x2', '3x3', '4x4', '5x5'],
      required: [true, 'Cube type is required'],
    },
    initialState: {
      type: [String],
      required: [true, 'Initial cube state is required'],
    },
    solveMoves: {
      type: [String], // Array of move notations (e.g., ["R", "U'", "F2"])
      required: [true, 'Solve moves are required'],
    },
    moveCount: {
      type: Number,
      required: true,
    },
    solveTime: {
      type: Number, // in milliseconds (sent from frontend timer)
      default: null,
    },
    solved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

solveHistorySchema.index({ userId: 1, createdAt: -1 });
solveHistorySchema.index({ userId: 1, cubeType: 1, createdAt: -1 });

module.exports = mongoose.model('SolveHistory', solveHistorySchema);
