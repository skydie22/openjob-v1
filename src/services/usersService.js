const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { NotFoundError, InvariantError, AuthenticationError } = require('../utils/errors');

const createUser = async ({ name, email, password, role }) => {
  const id = `user-${uuidv4()}`;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, created_at, updated_at',
    [id, name, email, hashedPassword, role]
  );

  if (!result.rowCount) throw new InvariantError('Failed to register user');
  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  if (!result.rowCount) throw new NotFoundError('User not found');
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (!result.rowCount) throw new AuthenticationError('Invalid email or password');
  return result.rows[0];
};

const verifyUserCredentials = async (email, password) => {
  const user = await getUserByEmail(email);
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new AuthenticationError('Invalid email or password');
  return user;
};

module.exports = { createUser, getUserById, getUserByEmail, verifyUserCredentials };