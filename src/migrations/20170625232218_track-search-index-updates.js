
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.layers ADD COLUMN features_indexed boolean;`)
  ])
}

exports.down = function () {
  return Promise.resolve()
}
