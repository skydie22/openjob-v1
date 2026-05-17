const express = require('express');
const router = express.Router();
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  getApplicationsByUser,
  getApplicationsByJob,
  updateApplicationStatus,
  deleteApplication,
} = require('../services/applicationsService');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { applicationSchema, applicationStatusSchema } = require('../validators');

// Specific routes first
router.get('/user/:userId', authenticate, async (req, res, next) => {
  try {
    const applications = await getApplicationsByUser(req.params.userId);
    res.json({ status: 'success', data: { applications } });
  } catch (error) {
    next(error);
  }
});

router.get('/job/:jobId', authenticate, async (req, res, next) => {
  try {
    const applications = await getApplicationsByJob(req.params.jobId);
    res.json({ status: 'success', data: { applications } });
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const applications = await getAllApplications();
    res.json({ status: 'success', data: { applications } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const application = await getApplicationById(req.params.id);
    res.json({ status: 'success', data: { application } });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, validateBody(applicationSchema), async (req, res, next) => {
  try {
    const application = await createApplication({ ...req.body, user_id: req.user.id });
    res.status(201).json({ status: 'success', message: 'Application submitted', data: { application } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, validateBody(applicationStatusSchema), async (req, res, next) => {
  try {
    const application = await updateApplicationStatus(req.params.id, req.user.id, req.body.status);
    res.json({ status: 'success', message: 'Application status updated', data: { application } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await deleteApplication(req.params.id, req.user.id);
    res.json({ status: 'success', message: 'Application deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
