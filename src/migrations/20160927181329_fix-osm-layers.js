
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.raw(`UPDATE omh.layers SET presets='[]' where owned_by_group_id='OpenStreetMap'`),
    knex.raw(`UPDATE omh.layers SET preview_position='{"zoom":12.299805624251407,"lng":-77.03572985993173,"lat":38.897025163478816,"bbox":[[-77.06362009031574,38.88074358003209],[-77.00783962954785,38.91330301490717]]}' where owned_by_group_id='OpenStreetMap'`),
    knex.raw(`UPDATE omh.layers SET thumbnail=NULL where owned_by_group_id='OpenStreetMap'`)
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.raw(`UPDATE omh.layers SET presets=NULL where owned_by_group_id='OpenStreetMap'`)
  ])
}
