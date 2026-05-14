const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;


const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};


const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = { hashPassword, comparePassword };
