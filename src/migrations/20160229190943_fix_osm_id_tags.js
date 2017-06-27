
exports.up = function(knex, Promise) {
  return Promise.all([
    knex('current_node_tags').update({k: 'osm_id_orig'}).where({k: 'osm_id'}),
    knex('current_way_tags').update({k: 'osm_id_orig'}).where({k: 'osm_id'}),
    knex('current_relation_tags').update({k: 'osm_id_orig'}).where({k: 'osm_id'})
  ]);
};

exports.down = function() {

};
