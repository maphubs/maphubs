/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return Promise.all([
    knex.raw('ALTER TABLE omh.images ADD COLUMN thumbnail text;')
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.raw('ALTER TABLE omh.images DROP COLUMN thumbnail;')
  ])
}
