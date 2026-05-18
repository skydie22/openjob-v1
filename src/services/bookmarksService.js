const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { NotFoundError, InvariantError } = require('../utils/errors');

const createBookmark = async ({ user_id, job_id }) => {
  const id = `bm-${uuidv4()}`;
  const result = await pool.query(
    'INSERT INTO bookmarks (id, user_id, job_id) VALUES ($1,$2,$3) ON CONFLICT (user_id, job_id) DO NOTHING RETURNING id, user_id, job_id, created_at',
    [id, user_id, job_id]
  );
  if (!result.rowCount) throw new InvariantError('Job already bookmarked');
  return result.rows[0];
};

const getBookmarkById = async (id) => {
  const result = await pool.query(
    `SELECT b.id, b.created_at, u.name AS user_name, j.title AS job_title
     FROM bookmarks b
     JOIN users u ON b.user_id = u.id
     JOIN jobs j ON b.job_id = j.id
     WHERE b.id = $1`,
    [id]
  );
  if (!result.rowCount) throw new NotFoundError('Bookmark not found');
  return result.rows[0];
};

const deleteBookmarkByUserAndJob = async ({ user_id, job_id }) => {
  const result = await pool.query(
    'DELETE FROM bookmarks WHERE user_id = $1 AND job_id = $2',
    [user_id, job_id]
  );
  if (!result.rowCount) throw new NotFoundError('Bookmark not found');
};

const getBookmarksByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT b.id, b.created_at,
            j.id AS job_id, j.title AS job_title, j.job_type, j.location,
            c.name AS company_name
     FROM bookmarks b
     JOIN jobs j ON b.job_id = j.id
     JOIN companies c ON j.company_id = c.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [user_id]
  );
  return result.rows;
};

const getAllBookmarks = async () => {
  const result = await pool.query(
    `SELECT b.id, b.created_at,
            u.name AS user_name,
            j.title AS job_title
     FROM bookmarks b
     JOIN users u ON b.user_id = u.id
     JOIN jobs j ON b.job_id = j.id
     ORDER BY b.created_at DESC`
  );
  return result.rows;
};

module.exports = {
  createBookmark,
  getBookmarkById,
  deleteBookmarkByUserAndJob,
  getBookmarksByUser,
  getAllBookmarks,
};
