
exports.up = function(knex, Promise) {
  return knex.raw(`ALTER TABLE omh.layers ADD COLUMN disable_export boolean NOT NULL DEFAULT false;`);
};

exports.down = function(knex, Promise) {
  return knex.raw(`ALTER TABLE omh.layers DROP COLUMN disable_export;`);
};
