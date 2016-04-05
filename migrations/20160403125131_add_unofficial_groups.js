
exports.up = function(knex, Promise) {
  return knex.raw(`ALTER TABLE omh.groups ADD COLUMN unofficial boolean NOT NULL DEFAULT false;`)
};

exports.down = function(knex, Promise) {
    return knex.raw(`ALTER TABLE omh.groups DROP COLUMN unofficial;`);
};
