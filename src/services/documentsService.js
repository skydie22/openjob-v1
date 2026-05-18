const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { NotFoundError, InvariantError, AuthorizationError } = require('../utils/errors');
const path = require('path');
const fs = require('fs');

const createDocument = async ({ user_id, name, file_url, file_type }) => {
  const id = `doc-${uuidv4()}`;
  const result = await pool.query(
    'INSERT INTO documents (id, user_id, name, file_url, file_type) VALUES ($1,$2,$3,$4,$5) RETURNING id, user_id, name, file_url, file_type, created_at, updated_at',
    [id, user_id, name, file_url, file_type]
  );
  if (!result.rowCount) throw new InvariantError('Failed to upload document');
  return result.rows[0];
};

const getAllDocuments = async () => {
  const result = await pool.query(
    `SELECT d.id, d.name, d.file_url, d.file_type, d.created_at, u.name AS user_name
     FROM documents d JOIN users u ON d.user_id = u.id
     ORDER BY d.created_at DESC`
  );
  return result.rows;
};

const getDocumentById = async (id) => {
  const result = await pool.query(
    `SELECT d.*, u.name AS user_name FROM documents d
     JOIN users u ON d.user_id = u.id WHERE d.id = $1`,
    [id]
  );
  if (!result.rowCount) throw new NotFoundError('Document not found');
  return result.rows[0];
};

const deleteDocument = async (id, userId) => {
  const doc = await pool.query('SELECT user_id, file_url FROM documents WHERE id = $1', [id]);
  if (!doc.rowCount) throw new NotFoundError('Document not found');
  if (doc.rows[0].user_id !== userId) throw new AuthorizationError('You are not authorized to delete this document');

  // Delete file from disk
  const filePath = path.join(process.cwd(), doc.rows[0].file_url);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await pool.query('DELETE FROM documents WHERE id = $1', [id]);
};

module.exports = { createDocument, getAllDocuments, getDocumentById, deleteDocument };
