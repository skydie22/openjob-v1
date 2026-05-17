/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('jobs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    company_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"companies"',
      onDelete: 'CASCADE',
    },
    category_id: {
      type: 'VARCHAR(50)',
      references: '"categories"',
      onDelete: 'SET NULL',
    },
    title: {
      type: 'VARCHAR(200)',
      notNull: true,
    },
    description: {
      type: 'TEXT',
      notNull: true,
    },
    requirements: {
      type: 'TEXT',
    },
    salary_min: {
      type: 'BIGINT',
    },
    salary_max: {
      type: 'BIGINT',
    },
    location: {
      type: 'VARCHAR(150)',
    },
    job_type: {
      type: 'VARCHAR(50)',
      default: 'full-time',
    },
    is_active: {
      type: 'BOOLEAN',
      default: true,
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('jobs');
};
