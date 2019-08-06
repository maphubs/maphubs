
exports.up = function (knex) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.layers ADD COLUMN remote boolean NOT NULL DEFAULT false;`),
    knex.raw(`ALTER TABLE omh.layers ADD COLUMN remote_host text;`),
    knex.raw(`ALTER TABLE omh.layers ADD COLUMN remote_layer_id int;`)
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.layers DROP COLUMN remote boolean;`),
    knex.raw(`ALTER TABLE omh.layers DROP COLUMN remote_host;`),
    knex.raw(`ALTER TABLE omh.layers DROP COLUMN remote_layer_id;`)
  ])
}
