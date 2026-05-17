/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('companies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    name: {
      type: 'VARCHAR(150)',
      notNull: true,
    },
    description: {
      type: 'TEXT',
    },
    industry: {
      type: 'VARCHAR(100)',
    },
    location: {
      type: 'VARCHAR(150)',
    },
    website: {
      type: 'VARCHAR(255)',
    },
    logo_url: {
      type: 'TEXT',
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
  pgm.dropTable('companies');
};
