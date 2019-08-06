
exports.up = function (knex) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.maps ADD COLUMN basemap text;`),
    knex.raw(`ALTER TABLE omh.hubs ADD COLUMN basemap text;`)
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.maps DROP COLUMN basemap;`),
    knex.raw(`ALTER TABLE omh.hubs DROP COLUMN basemap;`)
  ])
}
