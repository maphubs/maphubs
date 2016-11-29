// @flow
var knex = require('../connection.js');
var debug = require('../services/debug')('models/tag');

module.exports = {

  getNodeTag(node_id: number, k: string, trx: any=null){
    let db = knex;
    if(trx){db = trx;}
    return db('current_node_tags').where({node_id, k});
  },

  setNodeTag(node_id: number, k: string, v: string, trx: any=null){
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

  removeNodeTag(node_id: number, k: string, trx: any=null){
    let db = knex;
    if(trx){db = trx;}
    return db('current_node_tags').del().where({node_id, k});
  },

  getWayTag(way_id: number, k: string, trx: any=null){
    debug('getWayTag');
    let db = knex;
    if(trx){db = trx;}
    return db('current_way_tags').where({way_id, k});
  },

  setWayTag(way_id: number, k: string, v: string, trx: any=null){
    debug('setWayTag');
    let db = knex;
    if(trx){db = trx;}
    return this.getWayTag(way_id, k,trx)
    .then(function(previousTag){
      if(previousTag && previousTag.length > 0){
        debug('previous way tag found - updating');
        return db('current_way_tags').update({v}).where({way_id, k});
      }else{
        debug('previous way tag not found - inserting');
        return db('current_way_tags').insert({way_id, k, v});
      }
    });
  },

  removeWayTag(way_id: number, k: string, trx: any=null){
    debug('removeWayTag');
    let db = knex;
    if(trx){db = trx;}
    return db('current_way_tags').del().where({way_id, k});
  },

  getRelationTag(relation_id: number, k: string, trx: any=null){
    debug('getRelationTag');
    let db = knex;
    if(trx){db = trx;}
    return db('current_relation_tags').where({relation_id, k});
  },

  setRelationTag(relation_id: number, k: string, v: string, trx: any=null){
    debug('setRelationTag');
    let db = knex;
    if(trx){db = trx;}
    return this.getRelationTag(relation_id, k, trx)
    .then(function(previousTag){
      if(previousTag && previousTag.length > 0){
        debug('previous relation found - updating');
        return db('current_relation_tags').update({v}).where({relation_id, k});
      }else{
        debug('previous relation tag not found - inserting');
        return db('current_relation_tags').insert({relation_id, k, v});
      }
    });
  },

  removeRelationTag(relation_id: number, k: string, trx: any=null){
    debug('removeRelationTag');
    let db = knex;
    if(trx){db = trx;}
    return db('current_relation_tags').del().where({relation_id, k});
  },

  getPolygonTag(layer_id: number, osm_id: number, k: string, trx: any=null){
    debug('getPolygonTag');
    let db = knex;
    if(trx){db = trx;}
    return db('current_way_tags').select('current_way_tags.way_id as id', 'k', 'v')
    .leftJoin('current_ways', 'current_ways.id', 'current_way_tags.way_id')
    .where('current_ways.layer_id', layer_id)
    .where('current_ways.id', osm_id)
    .then(function(wayTags){
      if(wayTags && wayTags.length > 0){
        return wayTags[0];
      }else{
        return null;
      }
    });
  },

  getMultiPolygonTag(layer_id: number, osm_id: number, k: string, trx: any=null){
    debug('getMultiPolygonTag');
    let db = knex;
    if(trx){db = trx;}
    return db('current_relation_tags').select('current_relation_tags.relation_id as id', 'k', 'v')
    .leftJoin('current_relations', 'current_relations.id', 'current_relation_tags.relation_id')
    .where('current_relations.layer_id', layer_id)
    .where('current_relations.id', osm_id)
    .then(function(relationTags){
      if(relationTags && relationTags.length > 0){
        return relationTags[0];
      }else{
        return null;
      }
    });
  },

  setPolygonTag(layer_id: number, osm_id: number, k: string, v: string, trx: any=null){
    debug('setPolygonTag');
    let db = knex;
    if(trx){db = trx;}
    var _this = this;
    return db('current_ways').select('id').where({layer_id, id: osm_id})
    .then(function(ways){
      if(ways && ways.length > 0){
        //insert way tag
        return _this.setWayTag(osm_id, k, v, trx);
      }else{
        throw new Error('multipolygon not found, layer: '+ layer_id + ' - id: '+ osm_id);
      }
    });
  },

  removePolygonTag(layer_id: number, osm_id: number, k: string, trx: any=null){
    debug('removePolygonTag');
    let db = knex;
    if(trx){db = trx;}
    var _this = this;
    return db('current_ways').select('id').where({layer_id, id: osm_id})
    .then(function(ways){
      if(ways && ways.length > 0){
        //insert way tag
        return _this.removeWayTag(osm_id, k, trx);
      }else{
        throw new Error('polygon not found, layer: '+ layer_id + ' - id: '+ osm_id);
      }
    });
  },

  setMultiPolygonTag(layer_id: number, osm_id: number, k: string, v: string, trx: any=null){
    debug('setMultiPolygonTag');
    let db = knex;
    if(trx){db = trx;}
    var _this = this;
    return db('current_relations').select('id').where({layer_id, id: osm_id})
    .then(function(relations){
      if(relations && relations.length > 0){
        //insert relation tag
        return _this.setRelationTag(osm_id, k, v, trx);
      }else{
        throw new Error('multipolygon not found, layer: '+ layer_id + ' - id: '+ osm_id);
      }
    });
  },

  removeMultiPolygonTag(layer_id: number, osm_id: number, k: string, trx: any=null){
    debug('removeMultiPolygonTag');
    let db = knex;
    if(trx){db = trx;}
    var _this = this;
    return db('current_relations').select('id').where({layer_id, id: osm_id})
    .then(function(relations){
      if(relations && relations.length > 0){
        return _this.removeRelationTag(osm_id, k, trx);
      }else{
        throw new Error('multipolygon not found, layer: '+ layer_id + ' - id: '+ osm_id);
      }
    });
  }


};
