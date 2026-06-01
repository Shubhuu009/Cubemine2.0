const SolverService = require('../services/solver.service');
const SolveHistory = require('../models/SolveHistory');
const User = require('../models/User');

const BEST_TIME_FIELD = {
  '2x2': 'bestTime2x2',
  '3x3': 'bestTime3x3',
  '4x4': 'bestTime4x4',
  '5x5': 'bestTime5x5',
};

const solveCube = async (req, res, next) => {
  try {
    const { cubeType, state, solveTime } = req.body;
    const result = SolverService.solve(state, cubeType);

    if (req.user) {
      await SolveHistory.create({
        userId: req.user._id,
        cubeType,
        initialState: state,
        solveMoves: result.moves,
        moveCount: result.moveCount,
        solveTime: solveTime || null,
        solved: result.solved,
      });

      const updateData = { $inc: { totalSolves: 1 } };
      const bestTimeField = BEST_TIME_FIELD[cubeType];

      if (solveTime && bestTimeField && (!req.user[bestTimeField] || solveTime < req.user[bestTimeField])) {
        updateData.$set = { [bestTimeField]: solveTime };
      }

      await User.findByIdAndUpdate(req.user._id, updateData);
    }

    res.status(200).json({
      success: true,
      message: `${cubeType} cube solved successfully`,
      data: {
        cubeType,
        moves: result.moves,
        moveCount: result.moveCount,
        explanation: result.explanation,
        solved: result.solved,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { solveCube };
