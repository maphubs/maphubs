/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return knex.raw('ALTER TABLE omh.layers ADD COLUMN shortid text;')
}

exports.down = function (knex) {
  return knex.raw('ALTER TABLE omh.layers DROP COLUMN shortid;')
}
