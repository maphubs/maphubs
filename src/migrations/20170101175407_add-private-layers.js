
exports.up = function (knex) {
  return knex.raw('ALTER TABLE omh.layers ADD COLUMN private boolean NOT NULL DEFAULT false;')
}

exports.down = function (knex) {
  return knex.raw('ALTER TABLE omh.layers DROP COLUMN private;')
}
