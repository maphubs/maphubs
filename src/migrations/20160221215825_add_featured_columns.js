
exports.up = function (knex) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.layers ADD COLUMN featured boolean NOT NULL DEFAULT false;`),
    knex.raw(`ALTER TABLE omh.groups ADD COLUMN featured boolean NOT NULL DEFAULT false;`),
    knex.raw(`ALTER TABLE omh.hubs ADD COLUMN featured boolean NOT NULL DEFAULT false;`),
    knex.raw(`ALTER TABLE omh.stories ADD COLUMN featured boolean NOT NULL DEFAULT false;`)
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.layers DROP COLUMN featured;`),
    knex.raw(`ALTER TABLE omh.groups DROP COLUMN featured;`),
    knex.raw(`ALTER TABLE omh.hubs DROP COLUMN featured;`),
    knex.raw(`ALTER TABLE omh.stories DROP COLUMN featured;`)
  ])
}
