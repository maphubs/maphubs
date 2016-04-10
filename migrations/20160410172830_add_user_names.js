
exports.up = function(knex, Promise) {
  return knex.raw(`ALTER TABLE users ADD COLUMN name text;`);
};

exports.down = function(knex, Promise) {
  return knex.raw(`ALTER TABLE users DROP COLUMN name;`);
};
