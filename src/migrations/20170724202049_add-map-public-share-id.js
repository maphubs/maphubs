/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return knex.raw('ALTER TABLE omh.maps ADD COLUMN share_id text;')
}

exports.down = function (knex) {
  return knex.raw('ALTER TABLE omh.maps DROP COLUMN share_id;')
}
