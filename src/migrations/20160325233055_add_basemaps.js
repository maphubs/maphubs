/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return Promise.all([
    knex.raw('ALTER TABLE omh.maps ADD COLUMN basemap text;')
  ])
}

exports.down = function (knex) {
  return Promise.all([knex.raw('ALTER TABLE omh.maps DROP COLUMN basemap;')])
}
