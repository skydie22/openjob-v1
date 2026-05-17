const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { AuthenticationError, InvariantError } = require('../utils/errors');

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '3h' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_KEY);
};

const saveRefreshToken = async (token) => {
  await pool.query('INSERT INTO authentications (token) VALUES ($1)', [token]);
};

const verifyRefreshToken = async (token) => {
  const result = await pool.query('SELECT token FROM authentications WHERE token = $1', [token]);
  if (!result.rowCount) throw new AuthenticationError('Refresh token not found');

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
    return decoded;
  } catch {
    throw new AuthenticationError('Invalid refresh token');
  }
};

const deleteRefreshToken = async (token) => {
  const result = await pool.query('DELETE FROM authentications WHERE token = $1', [token]);
  if (!result.rowCount) throw new InvariantError('Refresh token not found');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
};
