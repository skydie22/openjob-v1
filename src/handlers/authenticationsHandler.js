const express = require('express');
const router = express.Router();
const { verifyUserCredentials } = require('../services/usersService');
const {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
} = require('../services/authService');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { loginSchema, refreshTokenSchema } = require('../validators');

// POST /authentications - Login
router.post('/', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await verifyUserCredentials(email, password);
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await saveRefreshToken(refreshToken);
    res.status(201).json({
      status: 'success',
      message: 'Login successful',
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /authentications - Refresh token
router.put('/', validateBody(refreshTokenSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = await verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(decoded.id);
    res.json({
      status: 'success',
      message: 'Access token refreshed',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /authentications - Logout
router.delete('/', authenticate, validateBody(refreshTokenSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await deleteRefreshToken(refreshToken);
    res.json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
