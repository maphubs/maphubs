
exports.up = function(knex, Promise) {
  return knex.raw(`ALTER TABLE omh.maps ADD COLUMN featured boolean NOT NULL DEFAULT false;`);
};

exports.down = function(knex, Promise) {
  return knex.raw(`ALTER TABLE omh.maps DROP COLUMN featured;`);
};
