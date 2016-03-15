
exports.up = function(knex, Promise) {
  return knex.raw(`ALTER TABLE omh.layers ADD COLUMN is_empty boolean NOT NULL DEFAULT false;`);
};

exports.down = function(knex, Promise) {
  return knex.raw(`ALTER TABLE omh.layers DROP COLUMN is_empty;`);
};
