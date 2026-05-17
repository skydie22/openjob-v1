const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { NotFoundError, InvariantError, AuthorizationError } = require('../utils/errors');

const createApplication = async ({ user_id, job_id, cover_letter }) => {
  const id = `app-${uuidv4()}`;
  const result = await pool.query(
    'INSERT INTO applications (id, user_id, job_id, cover_letter) VALUES ($1,$2,$3,$4) RETURNING id, status',
    [id, user_id, job_id, cover_letter]
  );
  if (!result.rowCount) throw new InvariantError('Failed to create application');
  return result.rows[0];
};

const getAllApplications = async () => {
  const result = await pool.query(
    `SELECT a.id, a.status, a.cover_letter, a.created_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email,
            j.id AS job_id, j.title AS job_title
     FROM applications a
     JOIN users u ON a.user_id = u.id
     JOIN jobs j ON a.job_id = j.id
     ORDER BY a.created_at DESC`
  );
  return result.rows;
};

const getApplicationById = async (id) => {
  const result = await pool.query(
    `SELECT a.*, u.name AS user_name, u.email AS user_email, j.title AS job_title
     FROM applications a
     JOIN users u ON a.user_id = u.id
     JOIN jobs j ON a.job_id = j.id
     WHERE a.id = $1`,
    [id]
  );
  if (!result.rowCount) throw new NotFoundError('Application not found');
  return result.rows[0];
};

const getApplicationsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT a.id, a.status, a.cover_letter, a.created_at,
            j.id AS job_id, j.title AS job_title,
            c.name AS company_name
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     JOIN companies c ON j.company_id = c.id
     WHERE a.user_id = $1
     ORDER BY a.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getApplicationsByJob = async (jobId) => {
  const result = await pool.query(
    `SELECT a.id, a.status, a.cover_letter, a.created_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email
     FROM applications a
     JOIN users u ON a.user_id = u.id
     WHERE a.job_id = $1
     ORDER BY a.created_at DESC`,
    [jobId]
  );
  return result.rows;
};

const updateApplicationStatus = async (id, userId, status) => {
  // Allow update by employer or applicant
  const app = await pool.query('SELECT user_id FROM applications WHERE id = $1', [id]);
  if (!app.rowCount) throw new NotFoundError('Application not found');

  const result = await pool.query(
    'UPDATE applications SET status=$1, updated_at=current_timestamp WHERE id=$2 RETURNING id, status',
    [status, id]
  );
  return result.rows[0];
};

const deleteApplication = async (id, userId) => {
  const app = await pool.query('SELECT user_id FROM applications WHERE id = $1', [id]);
  if (!app.rowCount) throw new NotFoundError('Application not found');
  if (app.rows[0].user_id !== userId) throw new AuthorizationError('You are not authorized to delete this application');
  await pool.query('DELETE FROM applications WHERE id = $1', [id]);
};

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  getApplicationsByUser,
  getApplicationsByJob,
  updateApplicationStatus,
  deleteApplication,
};
