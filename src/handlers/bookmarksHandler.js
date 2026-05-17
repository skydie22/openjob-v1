const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createBookmark,
  getBookmarkById,
  deleteBookmarkByUserAndJob,
  getBookmarksByUser,
  getAllBookmarks,
} = require('../services/bookmarksService');
const { authenticate } = require('../middleware/auth');

// POST /jobs/:jobId/bookmark
router.post('/', authenticate, async (req, res, next) => {
  try {
    const bookmark = await createBookmark({ user_id: req.user.id, job_id: req.params.jobId });
    res.status(201).json({ status: 'success', message: 'Job bookmarked', data: { bookmark } });
  } catch (error) {
    next(error);
  }
});

// GET /jobs/:jobId/bookmark/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const bookmark = await getBookmarkById(req.params.id);
    res.json({ status: 'success', data: { bookmark } });
  } catch (error) {
    next(error);
  }
});

// DELETE /jobs/:jobId/bookmark
router.delete('/', authenticate, async (req, res, next) => {
  try {
    await deleteBookmarkByUserAndJob({ user_id: req.user.id, job_id: req.params.jobId });
    res.json({ status: 'success', message: 'Bookmark removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
