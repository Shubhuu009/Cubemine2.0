const User = require('../models/User');
const SolveHistory = require('../models/SolveHistory');
const { isUsingMemoryStore } = require('../config/db');
const memoryStore = require('../services/memoryStore');
const getProfile = async (req, res, next) => {
  try {
    if (isUsingMemoryStore()) {
      const user = memoryStore.findUserById(req.user._id);

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: memoryStore.publicUser(user),
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalSolves: user.totalSolves,
        bestTime2x2: user.bestTime2x2,
        bestTime3x3: user.bestTime3x3,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = { userId: req.user._id };
    if (req.query.cubeType && ['2x2', '3x3'].includes(req.query.cubeType)) {
      filter.cubeType = req.query.cubeType;
    }

    if (isUsingMemoryStore()) {
      const { history, total } = memoryStore.getHistory({
        userId: req.user._id,
        cubeType: filter.cubeType,
        skip,
        limit,
      });

      return res.status(200).json({
        success: true,
        data: {
          history,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            hasMore: skip + limit < total,
          },
        },
      });
    }

    const [history, total] = await Promise.all([
      SolveHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SolveHistory.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasMore: skip + limit < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
const getLeaderboard = async (req, res, next) => {
  try {
    const sortBy = req.query.sortBy || 'totalSolves'; // totalSolves, bestTime2x2, bestTime3x3
    const limit = Math.min(parseInt(req.query.limit) || 25, 100);

    if (isUsingMemoryStore()) {
      const leaderboard = memoryStore
        .getLeaderboard({ sortBy, limit })
        .map((user, index) => ({
          rank: index + 1,
          username: user.username,
          totalSolves: user.totalSolves,
          bestTime2x2: user.bestTime2x2,
          bestTime3x3: user.bestTime3x3,
          memberSince: user.createdAt,
        }));

      return res.status(200).json({
        success: true,
        data: {
          leaderboard,
          sortBy,
          total: leaderboard.length,
        },
      });
    }

    let sortField = {};
    let filter = {};

    switch (sortBy) {
      case 'bestTime2x2':
        sortField = { bestTime2x2: 1 };
        filter = { bestTime2x2: { $ne: null } };
        break;
      case 'bestTime3x3':
        sortField = { bestTime3x3: 1 };
        filter = { bestTime3x3: { $ne: null } };
        break;
      default:
        sortField = { totalSolves: -1 };
        filter = { totalSolves: { $gt: 0 } };
    }

    const users = await User.find(filter)
      .select('username totalSolves bestTime2x2 bestTime3x3 createdAt')
      .sort(sortField)
      .limit(limit)
      .lean();

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      totalSolves: user.totalSolves,
      bestTime2x2: user.bestTime2x2,
      bestTime3x3: user.bestTime3x3,
      memberSince: user.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        sortBy,
        total: leaderboard.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
const getStatistics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cubeTypeFilter = req.query.cubeType;

    const filter = { userId };
    if (cubeTypeFilter && ['2x2', '3x3'].includes(cubeTypeFilter)) {
      filter.cubeType = cubeTypeFilter;
    }

    if (isUsingMemoryStore()) {
      const { history: solves } = memoryStore.getHistory({
        userId,
        cubeType: filter.cubeType,
        limit: 500,
      });

      return sendStatistics(res, solves);
    }
    const solves = await SolveHistory.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .select('cubeType moveCount solveTime solved createdAt')
      .lean();

    return sendStatistics(res, solves);
  } catch (error) {
    next(error);
  }
};

const sendStatistics = (res, solves) => {
    const solvesWithTime = solves.filter((s) => s.solveTime != null);
    const totalSolves = solves.length;
    const solvedCount = solves.filter((s) => s.solved).length;
    let avgTime = 0;
    let bestTime = null;
    let worstTime = null;
    let medianTime = null;

    if (solvesWithTime.length > 0) {
      const times = solvesWithTime.map((s) => s.solveTime).sort((a, b) => a - b);
      bestTime = times[0];
      worstTime = times[times.length - 1];
      avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      medianTime = times.length % 2 === 0
        ? Math.round((times[times.length / 2 - 1] + times[times.length / 2]) / 2)
        : times[Math.floor(times.length / 2)];
    }
    const avgMoves = totalSolves > 0
      ? Math.round(solves.reduce((a, s) => a + s.moveCount, 0) / totalSolves)
      : 0;
    const computeAverage = (arr, n) => {
      if (arr.length < n) return null;
      const recent = arr.slice(0, n);
      if (n >= 5) {
        recent.sort((a, b) => a - b);
        const trimmed = recent.slice(1, -1);
        return Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);
      }
      return Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
    };

    const recentTimes = solvesWithTime.map((s) => s.solveTime);
    const ao5 = computeAverage(recentTimes, 5);
    const ao12 = computeAverage(recentTimes, 12);
    const ao50 = computeAverage(recentTimes, 50);
    const ao100 = computeAverage(recentTimes, 100);
    const distribution = { '<5s': 0, '5-10s': 0, '10-20s': 0, '20-30s': 0, '30-60s': 0, '>60s': 0 };
    solvesWithTime.forEach((s) => {
      const sec = s.solveTime / 1000;
      if (sec < 5) distribution['<5s']++;
      else if (sec < 10) distribution['5-10s']++;
      else if (sec < 20) distribution['10-20s']++;
      else if (sec < 30) distribution['20-30s']++;
      else if (sec < 60) distribution['30-60s']++;
      else distribution['>60s']++;
    });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSolves = solves.filter((s) => new Date(s.createdAt) >= thirtyDaysAgo);
    const dailyCounts = {};
    recentSolves.forEach((s) => {
      const day = new Date(s.createdAt).toISOString().split('T')[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });
    const dailyActivity = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyActivity.push({ date: key, count: dailyCounts[key] || 0 });
    }
    const timeTrend = solvesWithTime
      .slice(0, 50)
      .reverse()
      .map((s) => ({
        time: s.solveTime,
        date: s.createdAt,
        cubeType: s.cubeType,
      }));
    const cubeBreakdown = {
      '2x2': solves.filter((s) => s.cubeType === '2x2').length,
      '3x3': solves.filter((s) => s.cubeType === '3x3').length,
    };
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (dailyCounts[key]) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === 0) currentStreak = 0;
        tempStreak = 0;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalSolves,
          solvedCount,
          successRate: totalSolves > 0 ? Math.round((solvedCount / totalSolves) * 100) : 0,
          avgTime,
          bestTime,
          worstTime,
          medianTime,
          avgMoves,
          currentStreak,
          longestStreak,
        },
        averages: { ao5, ao12, ao50, ao100 },
        distribution,
        dailyActivity,
        timeTrend,
        cubeBreakdown,
      },
    });
};

module.exports = { getProfile, getHistory, getLeaderboard, getStatistics };
