
exports.up = function (knex) {
  return Promise.all([
    knex.raw('drop table if exists current_relations cascade;'),
    knex.raw('drop table if exists current_ways cascade;'),
    knex.raw('drop table if exists current_nodes cascade;'),
    knex.raw('drop table if exists current_node_tags cascade;'),
    knex.raw('drop table if exists node_tags cascade;'),
    knex.raw('drop table if exists nodes cascade;'),
    knex.raw('drop table if exists relations cascade;'),
    knex.raw('drop table if exists relation_members cascade;'),
    knex.raw('drop table if exists relation_tags cascade;'),
    knex.raw('drop table if exists current_relation_tags cascade;'),
    knex.raw('drop table if exists current_relation_members cascade;'),
    knex.raw('drop table if exists current_way_tags cascade;'),
    knex.raw('drop table if exists current_way_nodes cascade;'),
    knex.raw('drop table if exists ways cascade;'),
    knex.raw('drop table if exists way_tags cascade;'),
    knex.raw('drop table if exists way_nodes cascade;'),
    knex.raw('drop table if exists gpx_file_tags cascade;'),
    knex.raw('drop table if exists gpx_files cascade;'),
    knex.raw('drop table if exists gps_points cascade;'),
    knex.raw('drop table if exists diary_comments cascade;'),
    knex.raw('drop table if exists diary_entries cascade;'),
    knex.raw('drop table if exists friends cascade;'),
    knex.raw('drop table if exists languages cascade;'),
    knex.raw('drop table if exists messages cascade;'),
    knex.raw('drop table if exists changeset_tags cascade;'),
    knex.raw('drop table if exists changesets cascade;')
  ])
}

exports.down = function () {
  return Promise.resolve()
}
