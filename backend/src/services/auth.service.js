const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const { isUsingMemoryStore } = require('../config/db');
const memoryStore = require('./memoryStore');

const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo?id_token=';

const toPublicUser = (user) => ({
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
});

const createUsernameFromGoogle = (payload) => {
  const source = payload.name || payload.email.split('@')[0] || 'google_user';
  const cleaned = source.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').slice(0, 22);
  return `${cleaned || 'google_user'}_${String(payload.sub).slice(-6)}`;
};

const verifyGoogleToken = async (credential) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    const error = new Error('Google login is not configured on the server');
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(`${GOOGLE_TOKENINFO_URL}${encodeURIComponent(credential)}`);
  if (!response.ok) {
    const error = new Error('Invalid Google credential');
    error.statusCode = 401;
    throw error;
  }

  const payload = await response.json();
  if (payload.aud !== process.env.GOOGLE_CLIENT_ID || !payload.email || !payload.sub) {
    const error = new Error('Google credential was not issued for this app');
    error.statusCode = 401;
    throw error;
  }

  if (payload.email_verified !== 'true' && payload.email_verified !== true) {
    const error = new Error('Google email is not verified');
    error.statusCode = 401;
    throw error;
  }

  return payload;
};

class AuthService {
  
  static async signup({ username, email, password }) {
    if (isUsingMemoryStore()) {
      const existingUser = memoryStore.findUserByEmailOrUsername({ email, username });

      if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
        const error = new Error(`${field} already registered`);
        error.statusCode = 409;
        throw error;
      }

      const hashedPassword = await hashPassword(password);
      const user = memoryStore.createUser({ username, email, password: hashedPassword });
      const token = generateToken({ id: user._id, email: user.email });

      return {
        user: memoryStore.publicUser(user),
        token,
      };
    }
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      const error = new Error(`${field} already registered`);
      error.statusCode = 409;
      throw error;
    }
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    const token = generateToken({ id: user._id, email: user.email });
    return {
      user: toPublicUser(user),
      token,
    };
  }

  
  static async login({ email, password }) {
    if (isUsingMemoryStore()) {
      const user = memoryStore.findUserByEmail(email);

      if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }

      if (!user.password) {
        const error = new Error('This account uses Google. Continue with Google instead.');
        error.statusCode = 401;
        throw error;
      }

      const isMatch = await comparePassword(password, user.password);

      if (!isMatch) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }

      const token = generateToken({ id: user._id, email: user.email });

      return {
        user: memoryStore.publicUser(user),
        token,
      };
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }
    if (!user.password) {
      const error = new Error('This account uses Google. Continue with Google instead.');
      error.statusCode = 401;
      throw error;
    }
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }
    const token = generateToken({ id: user._id, email: user.email });

    return {
      user: toPublicUser(user),
      token,
    };
  }

  static async googleLogin({ credential }) {
    const googleUser = await verifyGoogleToken(credential);
    const email = googleUser.email.toLowerCase();

    if (isUsingMemoryStore()) {
      let user = memoryStore.findUserByGoogleId(googleUser.sub) || memoryStore.findUserByEmail(email);
      if (user) {
        user = memoryStore.updateUser(user._id, {
          authProvider: 'google',
          googleId: googleUser.sub,
          avatar: googleUser.picture || user.avatar || null,
        });
      } else {
        user = memoryStore.createUser({
          username: createUsernameFromGoogle(googleUser),
          email,
          authProvider: 'google',
          googleId: googleUser.sub,
          avatar: googleUser.picture || null,
        });
      }

      const token = generateToken({ id: user._id, email: user.email });
      return { user: memoryStore.publicUser(user), token };
    }

    let user = await User.findOne({ $or: [{ googleId: googleUser.sub }, { email }] });
    if (user) {
      user.authProvider = 'google';
      user.googleId = googleUser.sub;
      user.avatar = googleUser.picture || user.avatar || null;
      await user.save();
    } else {
      user = await User.create({
        username: createUsernameFromGoogle(googleUser),
        email,
        authProvider: 'google',
        googleId: googleUser.sub,
        avatar: googleUser.picture || null,
      });
    }

    const token = generateToken({ id: user._id, email: user.email });
    return { user: toPublicUser(user), token };
  }
}

module.exports = AuthService;
