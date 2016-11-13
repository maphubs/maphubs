
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.images ADD COLUMN thumbnail text;`)
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.images DROP COLUMN thumbnail;`)
  ]);
};
