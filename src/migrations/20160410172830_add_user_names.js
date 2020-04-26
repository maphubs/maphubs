
exports.up = function (knex) {
  return knex.raw('ALTER TABLE users ADD COLUMN name text;')
}

exports.down = function (knex) {
  return knex.raw('ALTER TABLE users DROP COLUMN name;')
}
