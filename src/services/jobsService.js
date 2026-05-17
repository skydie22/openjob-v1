const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { NotFoundError, InvariantError, AuthorizationError } = require('../utils/errors');

const getAllJobs = async ({ title, 'company-name': companyName } = {}) => {
  let query = `
    SELECT j.id, j.title, j.description, j.requirements, j.salary_min, j.salary_max,
           j.location, j.job_type, j.is_active, j.created_at,
           c.id AS company_id, c.name AS company_name,
           cat.id AS category_id, cat.name AS category_name
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    LEFT JOIN categories cat ON j.category_id = cat.id
    WHERE 1=1
  `;
  const params = [];

  if (title) {
    params.push(`%${title}%`);
    query += ` AND j.title ILIKE $${params.length}`;
  }

  if (companyName) {
    params.push(`%${companyName}%`);
    query += ` AND c.name ILIKE $${params.length}`;
  }

  query += ' ORDER BY j.created_at DESC';
  const result = await pool.query(query, params);
  return result.rows;
};

const getJobById = async (id) => {
  const result = await pool.query(
    `SELECT j.*, c.name AS company_name, c.location AS company_location,
            cat.name AS category_name
     FROM jobs j
     LEFT JOIN companies c ON j.company_id = c.id
     LEFT JOIN categories cat ON j.category_id = cat.id
     WHERE j.id = $1`,
    [id]
  );
  if (!result.rowCount) throw new NotFoundError('Job not found');
  return result.rows[0];
};

const getJobsByCompany = async (companyId) => {
  const result = await pool.query(
    `SELECT j.*, cat.name AS category_name FROM jobs j
     LEFT JOIN categories cat ON j.category_id = cat.id
     WHERE j.company_id = $1 ORDER BY j.created_at DESC`,
    [companyId]
  );
  return result.rows;
};

const getJobsByCategory = async (categoryId) => {
  const result = await pool.query(
    `SELECT j.*, c.name AS company_name FROM jobs j
     LEFT JOIN companies c ON j.company_id = c.id
     WHERE j.category_id = $1 ORDER BY j.created_at DESC`,
    [categoryId]
  );
  return result.rows;
};

const createJob = async ({ company_id, category_id, title, description, requirements, salary_min, salary_max, location, job_type, is_active }) => {
  const id = `job-${uuidv4()}`;
  const result = await pool.query(
    `INSERT INTO jobs (id, company_id, category_id, title, description, requirements, salary_min, salary_max, location, job_type, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id, title`,
    [id, company_id, category_id || null, title, description, requirements, salary_min, salary_max, location, job_type, is_active]
  );
  if (!result.rowCount) throw new InvariantError('Failed to create job');
  return result.rows[0];
};

const updateJob = async (id, userId, data) => {
  // Verify ownership via company
  const job = await pool.query(
    'SELECT j.id, c.user_id FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = $1',
    [id]
  );
  if (!job.rowCount) throw new NotFoundError('Job not found');
  if (job.rows[0].user_id !== userId) throw new AuthorizationError('You are not authorized to update this job');

  const { company_id, category_id, title, description, requirements, salary_min, salary_max, location, job_type, is_active } = data;
  const result = await pool.query(
    `UPDATE jobs SET company_id=$1, category_id=$2, title=$3, description=$4, requirements=$5,
     salary_min=$6, salary_max=$7, location=$8, job_type=$9, is_active=$10, updated_at=current_timestamp
     WHERE id=$11 RETURNING id, title`,
    [company_id, category_id || null, title, description, requirements, salary_min, salary_max, location, job_type, is_active, id]
  );
  return result.rows[0];
};

const deleteJob = async (id, userId) => {
  const job = await pool.query(
    'SELECT j.id, c.user_id FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = $1',
    [id]
  );
  if (!job.rowCount) throw new NotFoundError('Job not found');
  if (job.rows[0].user_id !== userId) throw new AuthorizationError('You are not authorized to delete this job');
  await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
};

module.exports = { getAllJobs, getJobById, getJobsByCompany, getJobsByCategory, createJob, updateJob, deleteJob };
