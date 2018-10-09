
exports.up = function (knex) {
  return knex.raw(`
        UPDATE omh.maps a SET owned_by_user_id = b.user_id
        FROM omh.user_maps AS b
        WHERE a.map_id = b.map_id;
      `)
}

exports.down = function () {
  return Promise.resolve()
}
