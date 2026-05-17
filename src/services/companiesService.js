const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { NotFoundError, InvariantError, AuthorizationError } = require('../utils/errors');

const createCompany = async ({ user_id, name, description, industry, location, website, logo_url }) => {
  const id = `company-${uuidv4()}`;
  const result = await pool.query(
    `INSERT INTO companies (id, user_id, name, description, industry, location, website, logo_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id, name, description, industry, location, website, logo_url`,
    [id, user_id, name, description, industry, location, website, logo_url]
  );
  if (!result.rowCount) throw new InvariantError('Failed to create company');
  return result.rows[0];
};

const getAllCompanies = async () => {
  const result = await pool.query('SELECT id, name, description, industry, location, website, logo_url, created_at FROM companies ORDER BY created_at DESC');
  return result.rows;
};

const getCompanyById = async (id) => {
  const result = await pool.query(
    `SELECT c.id, c.name, c.description, c.industry, c.location, c.website, c.logo_url, c.created_at,
            u.name AS owner_name
     FROM companies c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.id = $1`,
    [id]
  );
  if (!result.rowCount) throw new NotFoundError('Company not found');
  return result.rows[0];
};

const updateCompany = async (id, userId, data) => {
  const company = await pool.query('SELECT user_id FROM companies WHERE id = $1', [id]);
  if (!company.rowCount) throw new NotFoundError('Company not found');
  if (company.rows[0].user_id !== userId) throw new AuthorizationError('You are not authorized to update this company');

  const { name, description, industry, location, website, logo_url } = data;
  const result = await pool.query(
    `UPDATE companies SET name=$1, description=$2, industry=$3, location=$4, website=$5, logo_url=$6, updated_at=current_timestamp
     WHERE id=$7 RETURNING id, name`,
    [name, description, industry, location, website, logo_url, id]
  );
  return result.rows[0];
};

const deleteCompany = async (id, userId) => {
  const company = await pool.query('SELECT user_id FROM companies WHERE id = $1', [id]);
  if (!company.rowCount) throw new NotFoundError('Company not found');
  if (company.rows[0].user_id !== userId) throw new AuthorizationError('You are not authorized to delete this company');
  await pool.query('DELETE FROM companies WHERE id = $1', [id]);
};

module.exports = { createCompany, getAllCompanies, getCompanyById, updateCompany, deleteCompany };
