
exports.up = function (knex) {
  return knex.raw(`ALTER TABLE omh.layers ADD COLUMN disable_feature_indexing boolean NOT NULL DEFAULT false;`)
}

exports.down = function (knex) {
  return knex.raw(`ALTER TABLE omh.layers DROP COLUMN disable_feature_indexing;`)
}
