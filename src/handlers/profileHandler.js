const express = require('express');
const router = express.Router();
const { getUserById } = require('../services/usersService');
const { getApplicationsByUser } = require('../services/applicationsService');
const { getBookmarksByUser } = require('../services/bookmarksService');
const { authenticate } = require('../middleware/auth');

// GET /profile - Get logged-in user profile
router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
});

// GET /profile/applications - Get logged-in user's applications
router.get('/applications', authenticate, async (req, res, next) => {
  try {
    const applications = await getApplicationsByUser(req.user.id);
    res.json({ status: 'success', data: { applications } });
  } catch (error) {
    next(error);
  }
});

// GET /profile/bookmarks - Get logged-in user's bookmarks
router.get('/bookmarks', authenticate, async (req, res, next) => {
  try {
    const bookmarks = await getBookmarksByUser(req.user.id);
    res.json({ status: 'success', data: { bookmarks } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
