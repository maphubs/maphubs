/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return knex.raw(
    "ALTER TABLE omh.maps ADD COLUMN settings json NOT NULL DEFAULT '{}';"
  )
}

exports.down = function (knex) {
  return knex.raw('ALTER TABLE omh.maps DROP COLUMN settings;')
}
