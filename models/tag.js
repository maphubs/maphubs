var knex = require('../connection.js');
var Promise = require('bluebird');

module.exports = {

  getNodeTag(node_id, k, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return db('current_node_tags').where({node_id, k});
  },

  setNodeTag(node_id, k, v, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return this.getNodeTag(node_id, k, trx)
    .then(function(previousTag){
      if(previousTag && previousTag.length > 0){
        return db('current_node_tags').update({v}).where({node_id, k});
      }else{
        return db('current_node_tags').insert({node_id, k, v});
      }
    });
  },

  removeNodeTag(node_id, k, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return db('current_node_tags').del().where({node_id, k});
  },

  getWayTag(way_id, k, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return db('current_way_tags').where({way_id, k});
  },

  setWayTag(way_id, k, v, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return this.getWayTag(way_id, k,trx)
    .then(function(previousTag){
      if(previousTag && previousTag.length > 0){
        return db('current_way_tags').update({v}).where({way_id, k});
      }else{
        return db('current_way_tags').insert({way_id, k, v});
      }
    });
  },

  removeWayTag(way_id, k, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return db('current_way_tags').del().where({way_id, k});
  },

  getRelationTag(relation_id, k, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return db('current_relation_tags').where({relation_id, k});
  },

  setRelationTag(relation_id, k, v, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return this.getRelationTag(relation_id, trx)
    .then(function(previousTag){
      if(previousTag && previousTag.length > 0){
        return db('current_relation_tags').update({v}).where({relation_id, k});
      }else{
        return db('current_relation_tags').insert({relation_id, k, v});
      }
    });
  },

  removeRelationTag(relation_id, k, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return db('current_relation_tags').del().where({relation_id, k});
  },

  getPolygonTag(layer_id, osm_id, k, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return Promise.all([
      db('current_way_tags').select('current_way_tags.way_id as id', 'k', 'v')
      .leftJoin('current_ways', 'current_ways.id', 'current_way_tags.way_id')
      .where('current_ways.layer_id', layer_id)
      .where('current_ways.id', osm_id),
      db('current_relation_tags').select('current_relation_tags.relation_id as id', 'k', 'v')
      .leftJoin('current_relations', 'current_relations.id', 'current_relation_tags.relation_id')
      .where('current_relations.layer_id', layer_id)
      .where('current_relations.id', osm_id)
    ]).then(function(results){
      var wayTags = results[0];
      var relationTags = results[1];
      if(wayTags && wayTags.length > 0){
        return wayTags[0];
      }else if(relationTags && relationTags.length > 0){
        return relationTags[0];
      }else{
        return null;
      }
    });
  },

  setPolygonTag(layer_id, osm_id, k, v, trx=null){
    let db = knex;
    if(trx){db = trx;}
    var _this = this;
    return Promise.all([
      db('current_ways').select('id').where({layer_id, id: osm_id}),
      db('current_relations').select('id').where({layer_id, id: osm_id})
    ]).then(function(results){
      var ways = results[0];
      var relations = results[1];
      if(ways && ways.length > 0){
        //insert way tag
        return _this.setWayTag(osm_id, k, v, trx);
      }else if(relations && relations.length > 0){
        //insert relation tag
        return _this.setRelationTag(osm_id, k, v, trx);
      }else{
        return null;
      }
    });
  },

  removePolygonTag(layer_id, osm_id, k, trx=null){
    let db = knex;
    if(trx){db = trx;}
    var _this = this;
    return Promise.all([
      db('current_ways').select('id').where({layer_id, id: osm_id}),
      db('current_relations').select('id').where({layer_id, id: osm_id})
    ]).then(function(results){
      var ways = results[0];
      var relations = results[1];
      if(ways && ways.length > 0){
        //insert way tag
        return _this.removeWayTag(osm_id, k, trx);
      }else if(relations && relations.length > 0){
        //insert relation tag
        return _this.removeRelationTag(osm_id, k, trx);
      }else{
        return null;
      }
    });
  }


};
