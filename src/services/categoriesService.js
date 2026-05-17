const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { NotFoundError, InvariantError } = require('../utils/errors');

const createCategory = async ({ name, description }) => {
  const id = `cat-${uuidv4()}`;
  const result = await pool.query(
    'INSERT INTO categories (id, name, description) VALUES ($1,$2,$3) RETURNING id, name, description',
    [id, name, description]
  );
  if (!result.rowCount) throw new InvariantError('Failed to create category');
  return result.rows[0];
};

const getAllCategories = async () => {
  const result = await pool.query('SELECT id, name, description, created_at FROM categories ORDER BY name ASC');
  return result.rows;
};

const getCategoryById = async (id) => {
  const result = await pool.query('SELECT id, name, description, created_at FROM categories WHERE id = $1', [id]);
  if (!result.rowCount) throw new NotFoundError('Category not found');
  return result.rows[0];
};

const updateCategory = async (id, { name, description }) => {
  const result = await pool.query(
    'UPDATE categories SET name=$1, description=$2, updated_at=current_timestamp WHERE id=$3 RETURNING id, name, description',
    [name, description, id]
  );
  if (!result.rowCount) throw new NotFoundError('Category not found');
  return result.rows[0];
};

const deleteCategory = async (id) => {
  const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  if (!result.rowCount) throw new NotFoundError('Category not found');
};

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };
