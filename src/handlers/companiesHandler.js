const express = require('express');
const router = express.Router();
const {
  createCompany, getAllCompanies, getCompanyById, updateCompany, deleteCompany,
} = require('../services/companiesService');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { companySchema } = require('../validators');

router.get('/', async (req, res, next) => {
  try {
    const companies = await getAllCompanies();
    res.json({ status: 'success', data: { companies } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const company = await getCompanyById(req.params.id);
    res.json({ status: 'success', data: { company } });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, validateBody(companySchema), async (req, res, next) => {
  try {
    const company = await createCompany({ ...req.body, user_id: req.user.id });
    res.status(201).json({ status: 'success', message: 'Company created', data: { company } });
  } catch (error) {
    // 23503 adalah kode PostgreSQL untuk Foreign Key Violation
    if (error.code === '23503') {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Gagal membuat company: User tidak ditemukan atau tidak valid.' 
      });
    }
    // Jika error lain, lempar ke global handler
    next(error);
  }
});

router.put('/:id', authenticate, validateBody(companySchema), async (req, res, next) => {
  try {
    const company = await updateCompany(req.params.id, req.user.id, req.body);
    res.json({ status: 'success', message: 'Company updated', data: { company } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await deleteCompany(req.params.id, req.user.id);
    res.json({ status: 'success', message: 'Company deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
