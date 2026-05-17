const express = require('express');
const router = express.Router();
const { getAllBookmarks } = require('../services/bookmarksService');
const { authenticate } = require('../middleware/auth');

// GET /bookmarks - Get all bookmarks for logged-in user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const bookmarks = await getAllBookmarks();
    res.json({ status: 'success', data: { bookmarks } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
