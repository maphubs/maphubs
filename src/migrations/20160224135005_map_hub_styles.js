/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return Promise.all([
    knex.raw('ALTER TABLE omh.map_layers ADD COLUMN legend_html text;'),
    knex.raw('ALTER TABLE omh.map_layers ADD COLUMN position int;')
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.raw('ALTER TABLE omh.map_layers DROP COLUMN legend_html text;'),
    knex.raw('ALTER TABLE omh.map_layers DROP COLUMN position int;')
  ])
}
