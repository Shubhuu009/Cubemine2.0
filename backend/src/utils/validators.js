


const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


const isValidPassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: 'Password is valid' };
};


const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Cube type configuration — single source of truth for all supported cube sizes
 */
const CUBE_CONFIGS = {
  '2x2': { gridSize: 2, facelets: 24, colorsPerFace: 4 },
  '3x3': { gridSize: 3, facelets: 54, colorsPerFace: 9 },
  '4x4': { gridSize: 4, facelets: 96, colorsPerFace: 16 },
  '5x5': { gridSize: 5, facelets: 150, colorsPerFace: 25 },
};

const VALID_CUBE_TYPES = Object.keys(CUBE_CONFIGS);

const isValidCubeState = (state, cubeType) => {
  if (!Array.isArray(state)) {
    return { valid: false, message: 'Cube state must be an array' };
  }

  const validColors = ['W', 'Y', 'R', 'O', 'B', 'G']; // White, Yellow, Red, Orange, Blue, Green
  const config = CUBE_CONFIGS[cubeType];

  if (!config) {
    return {
      valid: false,
      message: `Invalid cube type "${cubeType}". Supported types: ${VALID_CUBE_TYPES.join(', ')}`,
    };
  }

  const expectedLength = config.facelets;

  if (state.length !== expectedLength) {
    return {
      valid: false,
      message: `${cubeType} cube state must have exactly ${expectedLength} facelets`,
    };
  }
  for (const facelet of state) {
    if (!validColors.includes(facelet)) {
      return {
        valid: false,
        message: `Invalid color "${facelet}". Valid colors: ${validColors.join(', ')}`,
      };
    }
  }
  const countPerColor = expectedLength / 6;
  const colorCounts = {};
  for (const color of validColors) {
    colorCounts[color] = 0;
  }
  for (const facelet of state) {
    colorCounts[facelet]++;
  }
  for (const color of validColors) {
    if (colorCounts[color] !== countPerColor) {
      return {
        valid: false,
        message: `Each color must appear exactly ${countPerColor} times. "${color}" appears ${colorCounts[color]} times`,
      };
    }
  }

  return { valid: true, message: 'Cube state is valid' };
};

module.exports = { isValidEmail, isValidPassword, isValidUsername, isValidCubeState, CUBE_CONFIGS, VALID_CUBE_TYPES };
