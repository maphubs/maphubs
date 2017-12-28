
exports.up = function(knex) {
  return knex.raw(`ALTER TABLE omh.layers ADD COLUMN allow_public_submit boolean NOT NULL DEFAULT false;`);
};

exports.down = function(knex) {
  return knex.raw(`ALTER TABLE omh.layers DROP COLUMN allow_public_submit;`);
};
