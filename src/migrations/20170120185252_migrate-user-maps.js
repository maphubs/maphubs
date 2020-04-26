
exports.up = function (knex) {
  return knex.raw('ALTER TABLE omh.maps ADD COLUMN owned_by_user_id bigint;')
    .then(() => {
      return knex.raw(`
        UPDATE omh.maps SET owned_by_user_id = b.user_id
        FROM omh.maps AS a, omh.user_maps AS b
        WHERE a.map_id = b.map_id;
      `)
    })
}

exports.down = function (knex) {
  return knex.raw('ALTER TABLE omh.maps DROP COLUMN owned_by_user_id;')
}
