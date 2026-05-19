const Review = require('../models/Review');
const User = require('../models/User');

const getReviews = async (req, res, next) => {
  try {
    const { cubeType, sort = 'recent', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (cubeType && cubeType !== 'all') filter.cubeType = cubeType;

    const sortMap = {
      recent: { createdAt: -1 },
      helpful: { helpfulVotes: -1 },
      highest: { rating: -1 },
      lowest: { rating: 1 },
    };
    const sortField = sortMap[sort] || sortMap.recent;

    const [reviews, total] = await Promise.all([
      Review.find(filter).sort(sortField).skip(skip).limit(parseInt(limit)).lean(),
      Review.countDocuments(filter),
    ]);

    // Aggregate rating breakdown
    const allRatings = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allRatings.forEach((r) => { breakdown[r._id] = r.count; });

    const totalAll = await Review.countDocuments();
    const sumResult = await Review.aggregate([{ $group: { _id: null, sum: { $sum: '$rating' } } }]);
    const avgRating = totalAll > 0 && sumResult.length > 0 ? (sumResult[0].sum / totalAll).toFixed(1) : '0.0';

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          hasMore: skip + parseInt(limit) < total,
        },
        aggregate: { avgRating: parseFloat(avgRating), total: totalAll, breakdown },
      },
    });
  } catch (error) {
    next(error);
  }
};

const submitReview = async (req, res, next) => {
  try {
    const { rating, cubeType, title, body } = req.body;
    const userId = req.user._id;
    const username = req.user.username;

    // Verified if user has at least 1 solve
    const user = await User.findById(userId);
    const verified = (user?.totalSolves || 0) > 0;

    const existing = await Review.findOne({ userId });
    if (existing) {
      // Update their review
      existing.rating = rating;
      if (cubeType) existing.cubeType = cubeType;
      if (title !== undefined) existing.title = title;
      existing.body = body;
      existing.verified = verified;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: 'Review updated',
        data: existing,
      });
    }

    const review = await Review.create({ userId, username, rating, cubeType: cubeType || 'general', title, body, verified });

    res.status(201).json({ success: true, message: 'Review submitted', data: review });
  } catch (error) {
    next(error);
  }
};

const voteHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      const err = new Error('Review not found'); err.statusCode = 404; throw err;
    }
    if (review.userId.toString() === userId.toString()) {
      const err = new Error("You can't vote your own review"); err.statusCode = 400; throw err;
    }

    const alreadyVoted = review.helpfulVoters.some((v) => v.toString() === userId.toString());
    if (alreadyVoted) {
      review.helpfulVoters = review.helpfulVoters.filter((v) => v.toString() !== userId.toString());
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      review.helpfulVoters.push(userId);
      review.helpfulVotes += 1;
    }

    await review.save();
    res.status(200).json({
      success: true,
      data: { helpfulVotes: review.helpfulVotes, voted: !alreadyVoted },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, submitReview, voteHelpful };
