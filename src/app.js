require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/users', require('./handlers/usersHandler'));
app.use('/authentications', require('./handlers/authenticationsHandler'));
app.use('/companies', require('./handlers/companiesHandler'));
app.use('/categories', require('./handlers/categoriesHandler'));

// Jobs with nested bookmark routes
const jobsRouter = require('./handlers/jobsHandler');
const bookmarksHandler = require('./handlers/bookmarksHandler');
jobsRouter.use('/:jobId/bookmark', bookmarksHandler);
app.use('/jobs', jobsRouter);

app.use('/applications', require('./handlers/applicationsHandler'));
app.use('/bookmarks', require('./handlers/allBookmarksHandler'));
app.use('/documents', require('./handlers/documentsHandler'));
app.use('/profile', require('./handlers/profileHandler'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'failed', message: `Route ${req.method} ${req.path} not found` });
});

// Error handling middleware
app.use(require('./middleware/errorHandler').errorHandler);

module.exports = app;
