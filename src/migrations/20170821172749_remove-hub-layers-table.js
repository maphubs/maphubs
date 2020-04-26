
exports.up = function (knex) {
  return knex.raw('drop table omh.hub_layers;')
}

exports.down = function () {
  return Promise.resolve()
}
