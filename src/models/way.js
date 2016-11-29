// @flow

/**
* Way.js
*
* @description :: Represents ways, or roads.
* Schema : : http://chrisnatali.github.io/osm_notes/osm_schema.html#current_ways
*
*/

var _map = require('lodash.map');
var _includes = require('lodash.includes');
var Promise = require('bluebird');

var log = require('../services/log.js');
var chunk = require('../services/chunk.js');
//var Node = require('./node-model.js');
var WayNode = require('./way-node.js');
var WayTag = require('./way-tag.js');

var Way = {
  tableName: 'current_ways',

  attributes: {
    id: {
      type: 'integer',
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      numerical: true
    },
    changeset_id: {
      type: 'integer',
      numeric: true,
      primaryKey: true,
      autoIncrement: true,
      index: true,
      model: 'changesets'
    },
    timestamp: {
      type: 'datetime',
      date: true
    },
    visible: {
      type: 'boolean',
      boolean: true
    },
    version: {
      type: 'integer',
      numeric: true,
      index: true
    }
  },

  fromEntity(entity: any, meta: any, layerID: any) {
    var model = {};
    model.visible = (entity.visible !== 'false' && entity.visible !== false);
    model.version = parseInt(entity.version, 10) || 1;
    model.timestamp = new Date();
    model.layer_id = layerID;

    // Parse int on entity.id, so we can see if it's a negative id.
    var id = parseInt(entity.id, 10);
    if (id && id > 0) {
      model.id = id;
    }
    if (entity.changeset) {
      model.changeset_id = parseInt(entity.changeset, 10);
    }
    else if (meta && meta.id) {
      model.changeset_id = parseInt(meta.id);
    }
    return model;
  },

  fromOSM(xml: any) {

    // Transfer all attributes.
    var model = {};
    var attributes = xml.attrs();
    for (var i = 0, ii = attributes.length; i < ii; ++i) {
      var attr = attributes[i];
      model[attr.name()] = attr.value();
    }

    // Transfer tags and way nodes.
    var children = xml.childNodes();
    var tags = [];
    var keys = [];
    var nd = [];
    for (i = 0, ii = children.length; i < ii; ++i) {
      var child = children[i];
      var type = child.name();
      if (type === 'tag') {
        var k = child.attr('k').value();
        if(_includes(keys, k)){
          k = k + '_2';
        }
        keys.push(k);
        tags.push({
          k,
          v: child.attr('v').value()
        });
      }
      else if (type === 'nd') {
        nd.push({
          ref: child.attr('ref').value()
        });
      }
    }
    model.tag = tags;
    model.nd = nd;
    return model;
  },

  canBeDeleted(way_id: number) {
    // TODO add relations support
    return new Promise(function(fullfill) {
      fullfill(true);
    });
  },

  save(q: any) {
    var actions = [];
    var model = this;
    ['create', 'modify', 'delete'].forEach(function(action) {
      if (q.changeset[action].way) {
        actions.push(action);
      }
    });
    return Promise.map(actions, function(action) {
      return model[action](q);
    })
    .catch(function(err) {
      log.error('Way changeset fails', err);
      throw new Error(err);
    });
  },

  create(q: any) {

    var raw = q.changeset.create.way;
    if(!Array.isArray(raw)){
        raw = [raw];
    }

    // Create a list of models of just way creations with proper attributes.
    var models = raw.map(function(entity) {
       return Way.fromEntity(entity, q.meta, q.layerID); 
    });

    return Promise.map(chunk(models), function(models) {
      return q.transaction(Way.tableName).insert(models).returning('id');
    }, {concurrency: 1})
    .then(function(_ids) {
      var ids = [].concat.apply([], _ids);
      log.info('Remapping', ids.length, 'way IDs');
      var wayNodes = [];
      var tags: Array<any> = [];
      raw.forEach(function(entity, i) {
        // Map old id to new id.
        q.map.way[entity.id] = ids[i];
        // Update the changed id.
        entity.id = ids[i];
        // Take the node ID from the attached nd, unless it's less than zero;
        // In which case, use the value saved in map#node
        wayNodes.push(entity.nd.map(function(wayNode, i) {
          var id = parseInt(wayNode.ref, 10) > 0 ? wayNode.ref : q.map.node[wayNode.ref];
          return {
            way_id: entity.id,
            sequence_id: i,
            node_id: id
          };
        }));
        // Check if tags are present, and if so, save them.
        if (entity.tag){
          if(!Array.isArray(entity.tag)){
            entity.tag = [entity.tag];
          }
          if(entity.tag.length) {
            tags.push(entity.tag.map(function(tag: Object) {
              return {
                k: tag.k,
                v: tag.v,
                way_id: entity.id
              };
            }));
          }
        }
      });

      wayNodes = [].concat.apply([], wayNodes);
      return Promise.map(chunk(wayNodes), function(wn) {
        return q.transaction(WayNode.tableName).insert(wn);
      }, {concurrency: 1})
      .then(function() {
        if(!Array.isArray(tags)){
            tags = [tags];
        }
        if (tags.length) {
          tags = [].concat.apply([], tags);
          return Promise.map(chunk(tags), function(t) {
            return q.transaction(WayTag.tableName).insert(t);
          }, {concurrency: 1});
        }
        return [];

      });
    })
    .catch(function(err) {
      log.error('Inserting new ways', err);
      throw new Error(err);
    });
  },

  modify(q: any) {
    var raw = q.changeset.modify.way;
    if(!Array.isArray(raw)){
        raw = [raw];
    }

    return Promise.map(raw, function(entity) {
      var model = Way.fromEntity(entity, q.meta, q.layerID);
      return q.transaction(Way.tableName).where({id: entity.id, layer_id: q.layerID}).update(model);
    })

    // Delete old wayNodes and wayTags
    .then(function() {
      var ids = raw.map(function(entity) { return parseInt(entity.id, 10); });
      //TODO: confirm a way belongs to the layer_id before deleting nodes/tags
      return q.transaction(WayNode.tableName).whereIn('way_id', ids).del().then(function() {
        return q.transaction(WayTag.tableName).whereIn('way_id', ids).del();
      });
    })

    // Create new wayNodes and wayTags
    .then(function() {
      var tags = [];
      var wayNodes = [];
      raw.forEach(function(entity) {
        wayNodes.push(entity.nd.map(function(wayNode, i) {
          // Take the node ID from the attached nd, unless it's less than zero;
          // In which case, use the value saved in map#node
          var nodeId = parseInt(wayNode.ref, 10) > 0 ? wayNode.ref : q.map.node[wayNode.ref];
          return {
            way_id: entity.id,
            sequence_id: i,
            node_id: nodeId
          };
        }));
        if (entity.tag){
            if(!Array.isArray(entity.tag)){
                entity.tag = [entity.tag];
            }
            if(entity.tag.length) {
          tags.push(entity.tag.map(function(tag) {
            return {
              k: tag.k,
              v: tag.v,
              way_id: entity.id
            };
          }));
        }
      }
      });

      if (tags.length) {
        tags = [].concat.apply([], tags);
        // We execute this query as a side-effect on purpose;
        // Nothing depends on it, and it can execute asynchronously of anything else.
        q.transaction(WayTag.tableName).insert(tags).catch(function(err) {
          log.error('Creating way tags in create', err);
          throw new Error(err);
        });
      }
      wayNodes = [].concat.apply([], wayNodes);
      return q.transaction(WayNode.tableName).insert(wayNodes);
    })
    .catch(function(err) {
      log.error('Modifying ways', err);
      throw new Error(err);
    });
  },

  'delete'(q: any) {
    var raw = q.changeset['delete'].way;
    if(!Array.isArray(raw)){
        raw = [raw];
    }
    var ids = _map(raw, 'id');
    return q.transaction(Way.tableName).where({layer_id: q.layerID}).whereIn('id', ids)
    .update({visible: false, changeset_id: q.meta.id}).returning('id')
    .then(function(invisibleWays) {
      //TODO: confirm a way belongs to the layer_id before deleting nodes/tags
      q.transaction(WayTag.tableName).whereIn('way_id', invisibleWays).del();
      return q.transaction(WayNode.tableName).whereIn('way_id', invisibleWays).del();
    })
    .catch(function(err) {
      log.error('Deleting ways in delete', err);
      throw new Error(err);
    });
  }
};

module.exports = Way;
