exports.up = function(knex, Promise) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.layers ADD COLUMN screenshot text;`)
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.layers DROP COLUMN screenshot;`)
  ]);
};
