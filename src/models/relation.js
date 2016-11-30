// @flow
/*
 * Model for Relations
 *
 * Schema http://chrisnatali.github.io/osm_notes/osm_schema.html#relations
 *
 */

 var _map = require('lodash.map');
 var _includes = require('lodash.includes');
var Promise = require('bluebird');

var knex = require('../connection.js');
var Member = require('./relation-member.js');
var RelationTag = require('./relation-tag.js');
var log = require('../services/log');

var Relation = {

  tableName: 'current_relations',

  attributes: {
    id: {
      type: 'integer',
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      index: true
    },
    version: {
      type: 'integer',
      numeric: true,
      required: true
    },
    changeset_id: {
      type: 'integer',
      numeric: true,
      model: 'changesets'
    },
    visible: {
      type: 'boolean',
      boolean: true
    },
    timestamp: {
      type: 'datetime',
      datetime: true
    },
    redaction_id: {
      type: 'integer',
      numeric: true
    }
  },


  fromEntity(entity: any, meta: any, layerID: number) {
    var model = {};
    model.visible = (entity.visible !== 'false' && entity.visible !== false);
    model.version = parseInt(entity.version, 10) || 1;
    model.timestamp = new Date();
    model.layer_id = layerID;

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
    var members = [];
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
      else if (type === 'member') {
        members.push({
          ref: child.attr('ref').value(),
          role: child.attr('role').value(),
          type: child.attr('type').value()
        });
      }
    }
    model.tag = tags;
    model.member = members;
    return model;
  },

  createDependents(raw: Array<Object>, ids: Array<number>, map: any, trx: any) {
    var tags = [];
    var members = [];
    raw.forEach(function(entity, i) {

      var id = ids[i];
      if (entity.tag){
        if(!Array.isArray(entity.tag)){
          entity.tag = [entity.tag];
        }
        if(entity.tag.length) {
          tags.push(entity.tag.map(function(tag) {
            return {
              k: tag.k,
              v: tag.v,
              relation_id: id
            };
          }));
        }
      }

      if (entity.member && entity.member.length) {
        members.push(entity.member.map(function(member, i) {

          // We can use the map variable to get the newly-created entity ID
          // if the one that came from the editor is a negative value.
          if (parseInt(member.ref, 10) < 0) {
            member.ref = map[member.type][member.ref];
          }
          member.relation = id;
          member.i = i;
          return Member.fromEntity(member);
        }));
      }
    });

    return Promise.all([
      {data: members, table: Member.tableName},
      {data: tags, table: RelationTag.tableName}
    ].map(function(d) {
      if (d.data.length) {
        var data = [].concat.apply([], d.data);
        return knex.batchInsert(d.table, data, 1000).transacting(trx);
      }
      return [];
    }))
    .catch(function(err) {
      log.error('Creating relation tags and members', err);
      throw new Error(err);
    });
  },

  destroyDependents(ids, trx: any) {
    return Promise.all([
      trx(Member.tableName).whereIn('relation_id', ids).del(),
      trx(RelationTag.tableName).whereIn('relation_id', ids).del()
    ]).catch(function(err) {
      log.error('Destroying relation tags and members', err);
    });
  },

  save(q: any) {
    var actions = [];
    var model = this;
    ['create', 'modify', 'delete'].forEach(function(action) {
      if (q.changeset[action].relation) {
        actions.push(action);
      }
    });
    return Promise.map(actions, function(action) {
      return model[action](q);
    })
    .catch(function(err) {
      log.error('Relation changeset fails', err);
      throw new Error(err);
    });
  },

  create(q: any) {
    var raw = q.changeset.create.relation;
    if(!Array.isArray(raw)){
        raw = [raw];
    }

    var models = raw.map(function(entity) {
      return Relation.fromEntity(entity, q.meta, q.layerID);
    });
    return knex.batchInsert(Relation.tableName, models, 1000).returning('id')
    .transacting( q.transaction)
    .then(function(ids) {
      // We don't necessarily need to update these ids, but it's useful for testing,
      // as this will be included in the server response.
      /*
      raw.forEach(function(entity, i) {
        q.map.relation[entity.id] = ids[i];
      });
      */

      // Save members and tags.
      return Relation.createDependents(raw, ids, q.map, q.transaction);
    })
    .catch(function(err) {
      log.error('Inserting new relations', err);
      throw new Error(err);
    });
  },

  modify(q: any) {
    var raw = q.changeset.modify.relation;
    if(!Array.isArray(raw)){
        raw = [raw];
    }
    var ids = _map(raw, 'id');

    return Promise.map(raw, function(entity) {
      var model = Relation.fromEntity(entity, q.meta, q.layerID);
      return q.transaction(Relation.tableName).where({id: entity.id, layer_id: q.layerID}).update(model);
    })
    .then(function() {
      return Relation.destroyDependents(ids, q.transaction);
    })
    .then(function() {
      return Relation.createDependents(raw, ids, q.map, q.transaction);
    })
    .catch(function(err) {
      log.error('Modifying relationship status, it\'s complicated', err);
      throw new Error(err);
    });
  },

  // TODO this destroy function does not implement a check
  // to see if any relation is a part of any other relation.
  'delete'(q: any) {
    var raw = q.changeset['delete'].relation;
    if(!Array.isArray(raw)){
        raw = [raw];
    }
    var ids = _map(raw, 'id');

    return q.transaction(Relation.tableName).where({layer_id: q.layerID}).whereIn('id', ids)
    .update({visible: false, changeset_id: q.meta.id}).returning('id')
    .then(function(removed) {
      return Relation.destroyDependents(removed, q.transaction);
    })
    .catch(function(err) {
      log.error('Deleting relations in delete', err);
      throw new Error(err);
    });
  }
};

module.exports = Relation;
