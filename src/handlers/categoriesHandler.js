const express = require('express');
const router = express.Router();
const {
  createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory,
} = require('../services/categoriesService');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { categorySchema } = require('../validators');

router.get('/', async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.json({ status: 'success', data: { categories } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id);
    res.json({ status: 'success', data: { category } });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, validateBody(categorySchema), async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({ status: 'success', message: 'Category created', data: { category } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, validateBody(categorySchema), async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    res.json({ status: 'success', message: 'Category updated', data: { category } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await deleteCategory(req.params.id);
    res.json({ status: 'success', message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
