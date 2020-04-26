
exports.up = function (knex) {
  return knex.raw('CREATE INDEX layer_shortid_idx ON omh.layers (shortid);')
}

exports.down = function () {
  return Promise.resolve()
}
