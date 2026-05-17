const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createDocument, getAllDocuments, getDocumentById, deleteDocument } = require('../services/documentsService');
const { authenticate } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

router.get('/', async (req, res, next) => {
  try {
    const documents = await getAllDocuments();
    res.json({ status: 'success', data: { documents } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const document = await getDocumentById(req.params.id);
    res.json({ status: 'success', data: { document } });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'failed', message: 'No file uploaded' });
    }
    const document = await createDocument({
      user_id: req.user.id,
      name: req.file.originalname,
      file_url: `uploads/${req.file.filename}`,
      file_type: req.file.mimetype,
    });
    res.status(201).json({ status: 'success', message: 'Document uploaded', data: { document } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await deleteDocument(req.params.id, req.user.id);
    res.json({ status: 'success', message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
