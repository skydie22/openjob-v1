const express = require('express');
const router = express.Router();
const { createUser, getUserById } = require('../services/usersService');
const { validateBody } = require('../middleware/validate');
const { registerSchema } = require('../validators');

router.post('/', validateBody(registerSchema), async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
