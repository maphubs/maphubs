exports.up = function (knex, Promise) {
  return Promise.all([
    knex.raw(`UPDATE omh.layers SET settings='{}' where settings IS NULL`)
  ])
}

exports.down = function () {
  return Promise.resolve()
}
