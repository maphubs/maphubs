/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return knex.raw(
    'ALTER TABLE omh.maps ADD COLUMN featured boolean NOT NULL DEFAULT false;'
  )
}

exports.down = function (knex) {
  return knex.raw('ALTER TABLE omh.maps DROP COLUMN featured;')
}
