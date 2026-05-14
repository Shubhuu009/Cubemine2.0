const crypto = require('crypto');

const users = [];
const histories = [];

const now = () => new Date();

const cloneUser = (user) => (user ? { ...user } : null);

const publicUser = (user) => ({
  _id: user._id,
  id: user._id,
  username: user.username,
  email: user.email,
  totalSolves: user.totalSolves,
  bestTime2x2: user.bestTime2x2,
  bestTime3x3: user.bestTime3x3,
  bestTime4x4: user.bestTime4x4,
  bestTime5x5: user.bestTime5x5,
  authProvider: user.authProvider,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createUser = ({ username, email, password = null, authProvider = 'local', googleId = null, avatar = null }) => {
  const timestamp = now();
  const user = {
    _id: crypto.randomUUID(),
    username,
    email: email.toLowerCase(),
    password,
    authProvider,
    googleId,
    avatar,
    totalSolves: 0,
    bestTime2x2: null,
    bestTime3x3: null,
    bestTime4x4: null,
    bestTime5x5: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  users.push(user);
  return cloneUser(user);
};

const findUserByEmailOrUsername = ({ email, username }) => {
  const normalizedEmail = email?.toLowerCase();
  return cloneUser(
    users.find((user) => user.email === normalizedEmail || user.username === username)
  );
};

const findUserByEmail = (email) => {
  const normalizedEmail = email?.toLowerCase();
  return cloneUser(users.find((user) => user.email === normalizedEmail));
};

const findUserByGoogleId = (googleId) => cloneUser(users.find((user) => user.googleId === googleId));

const findUserById = (id) => cloneUser(users.find((user) => user._id === id));

const updateUser = (userId, updates) => {
  const user = users.find((entry) => entry._id === userId);
  if (!user) return null;
  Object.assign(user, updates, { updatedAt: now() });
  return cloneUser(user);
};

const updateUserStats = (userId, { cubeType, solveTime }) => {
  const user = users.find((entry) => entry._id === userId);
  if (!user) return null;

  user.totalSolves += 1;
  if (solveTime) {
    const bestTimeField = cubeType === '2x2' ? 'bestTime2x2' : 'bestTime3x3';
    if (!user[bestTimeField] || solveTime < user[bestTimeField]) {
      user[bestTimeField] = solveTime;
    }
  }
  user.updatedAt = now();
  return cloneUser(user);
};

const createHistory = (history) => {
  const timestamp = now();
  const entry = {
    _id: crypto.randomUUID(),
    ...history,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  histories.push(entry);
  return { ...entry };
};

const getHistory = ({ userId, cubeType, skip = 0, limit = 20 }) => {
  const filtered = histories
    .filter((entry) => entry.userId === userId && (!cubeType || entry.cubeType === cubeType))
    .sort((a, b) => b.createdAt - a.createdAt);

  return {
    history: filtered.slice(skip, skip + limit).map((entry) => ({ ...entry })),
    total: filtered.length,
  };
};

const getLeaderboard = ({ sortBy, limit }) => {
  let filtered = users.map(publicUser);

  if (sortBy === 'bestTime2x2') {
    filtered = filtered.filter((user) => user.bestTime2x2 != null);
    filtered.sort((a, b) => a.bestTime2x2 - b.bestTime2x2);
  } else if (sortBy === 'bestTime3x3') {
    filtered = filtered.filter((user) => user.bestTime3x3 != null);
    filtered.sort((a, b) => a.bestTime3x3 - b.bestTime3x3);
  } else {
    filtered = filtered.filter((user) => user.totalSolves > 0);
    filtered.sort((a, b) => b.totalSolves - a.totalSolves);
  }

  return filtered.slice(0, limit);
};

module.exports = {
  createUser,
  findUserByEmailOrUsername,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  updateUser,
  publicUser,
  updateUserStats,
  createHistory,
  getHistory,
  getLeaderboard,
};
