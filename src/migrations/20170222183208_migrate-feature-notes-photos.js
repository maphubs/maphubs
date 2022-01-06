/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return knex
    .raw(
      'alter table omh.feature_photo_attachments alter column osm_id type varchar(255) using osm_id::varchar'
    )
    .then(() => {
      return knex.raw(
        'ALTER TABLE omh.feature_photo_attachments RENAME COLUMN osm_id TO mhid;'
      )
    })
}

exports.down = function () {
  return Promise.resolve()
}
