const express = require('express');
const router = express.Router();
const {
  getAllJobs, getJobById, getJobsByCompany, getJobsByCategory, createJob, updateJob, deleteJob,
} = require('../services/jobsService');
const { authenticate } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validate');
const { jobSchema, jobQuerySchema } = require('../validators');

// IMPORTANT: specific routes must come before /:id
router.get('/company/:companyId', async (req, res, next) => {
  try {
    const jobs = await getJobsByCompany(req.params.companyId);
    res.json({ status: 'success', data: { jobs } });
  } catch (error) {
    next(error);
  }
});

router.get('/category/:categoryId', async (req, res, next) => {
  try {
    const jobs = await getJobsByCategory(req.params.categoryId);
    res.json({ status: 'success', data: { jobs } });
  } catch (error) {
    next(error);
  }
});

router.get('/', validateQuery(jobQuerySchema), async (req, res, next) => {
  try {
    const jobs = await getAllJobs(req.query);
    res.json({ status: 'success', data: { jobs } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const job = await getJobById(req.params.id);
    res.json({ status: 'success', data: { job } });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, validateBody(jobSchema), async (req, res, next) => {
  try {
    const job = await createJob(req.body);
    res.status(201).json({ status: 'success', message: 'Job created', data: { job } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, validateBody(jobSchema), async (req, res, next) => {
  try {
    const job = await updateJob(req.params.id, req.user.id, req.body);
    res.json({ status: 'success', message: 'Job updated', data: { job } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await deleteJob(req.params.id, req.user.id);
    res.json({ status: 'success', message: 'Job deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
