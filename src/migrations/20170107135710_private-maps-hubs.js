/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return Promise.all([
    knex.raw(
      'ALTER TABLE omh.maps ADD COLUMN private boolean NOT NULL DEFAULT false;'
    ),
    knex.raw('ALTER TABLE omh.maps ADD COLUMN owned_by_group_id text;')
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.raw('ALTER TABLE omh.maps DROP COLUMN private;'),
    knex.raw('ALTER TABLE omh.maps DROP COLUMN owned_by_group_id;')
  ])
}
