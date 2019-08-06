exports.up = function (knex) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.layers ADD COLUMN screenshot text;`)
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.layers DROP COLUMN screenshot;`)
  ])
}
