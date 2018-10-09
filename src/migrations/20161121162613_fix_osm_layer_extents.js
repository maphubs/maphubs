
exports.up = function (knex) {
  return knex.raw(`UPDATE omh.layers SET extent_bbox='[-175, -85, 175, 85]' where owned_by_group_id='OpenStreetMap'`)
}

exports.down = function () {
  return Promise.resolve()
}
