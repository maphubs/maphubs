/* @flow weak */
var _flatten = require('lodash.flatten');
var _assignIn = require('lodash.assignin');

var Promise = require('bluebird');

var knex = require('../connection.js');
var BoundingBox = require('../services/bounding-box.js');
var log = require('../services/log.js');
var Node = require('../models/node-model.js');
var Way = require('../models/way.js');
var Relation = require('../models/relation.js');

module.exports = {

  createChangeset(uid, trx = null) {
    let db = knex;
    if(trx){db = trx;}
      var now = new Date();
      return db('changesets')
        .returning('id')
        .insert({
          user_id: uid,
          created_at: now,
          closed_at: now,
          num_changes: 0
        });
    },

    getChangesetById(changesetID, trx = null) {
      let db = knex;
      if(trx){db = trx;}
      return db('changesets').where({id: changesetID})
      .then(function(result){
        if(result && result.length == 1){
          return result[0];
        }
        return null;
      });
    },

    closeChangeset(changesetID, trx = null) {
      let db = knex;
      if(trx){db = trx;}
        var now = new Date();
        return db('changesets')
          .where({id: changesetID})
          .update({
            closed_at: now
          });
      },

    processChangeset(changesetID, uid, layerID, changeset, trx = null) {
      var _this = this;
      let db = knex;
      if(trx){db = trx;}
      log.info("Processing Changeset: " + changesetID);

       return db('changesets').where('id', changesetID)
        .then(function(changesets) {
          if (changesets.length === 0) {
            throw new Error("Could not find changeset");
          }
          var meta = changesets[0];

          var time = new Date();
          log.info('Starting changeset transaction');

            var queryData = {
              // Map of old ids to newly-created ones.
              map: {
                node: {},
                way: {},
                relation: {}
              },
              transaction: db,
              changeset,
              meta,
              layerID
            };

            return _this.models.node.save(queryData)
            .then(function() {
              log.info('Nodes transaction completed', (new Date() - time) / 1000, 'seconds');
              time = new Date();
              return _this.models.way.save(queryData)
                .then(function() {
                  log.info('Ways transaction completed', (new Date() - time) / 1000, 'seconds');
                  time = new Date();
                  return _this.models.relation.save(queryData)
                  .then(function(saved) {
                    log.info('Relations transaction completed', (new Date() - time) / 1000, 'seconds');
                    time = new Date();
                    var newMeta = _this.updateChangeset(meta, changeset);
                    log.info('New changeset updated', (new Date() - time) / 1000, 'seconds');
                    return trx('changesets')
                      .where('id', meta.id)
                      .update(newMeta)
                      .then(function(){
                          return {changeset: _assignIn({}, newMeta, saved), created: queryData.map};
                      });
                  });
                });
            })
            .catch(function(err) {
              // Once we get here, rollback should happen automatically,
              // since we are returning promises in this transaction.
              // https://github.com/tgriesser/knex/issues/362

              log.error('Changeset update fails', err);
              throw err;
            });
        })
        .catch(function(err) {
          log.error('Changeset not found', err);
          //res.status(400).send({error: "Could not find changeset"});
          throw err;
        });
    },

    models: {
      node: Node,
      way: Way,
      relation: Relation
    },

    query(entity, changeset, meta, map, transaction, layerID) {
      var _this = this;
      var model = _this.models[entity];
      if (!model) {
        return;
      }
      var actions = ['create', 'modify', 'destroy'].map(function(action) {
        return _this.toArray(model.query[action](changeset, meta, map, transaction, layerID));
      });
      return Promise.all(_flatten(actions)).catch(function(err) {
        log.error(entity + ' changeset fails', err);
        transaction.rollback();
        throw new Error(err);
      });
    },

    toArray(val) {
      if (Array.isArray(val)) {
        return val;
      }
      return [val];
    },

    updateChangeset(meta, changeset) {

      // Keep track of the number of changes this upload operation is doing.
      var numChanges: number = parseInt(meta.num_changes, 10) || 0;
      var nodes = [];
      ['create', 'modify', 'delete'].forEach(function(action) {
        if (changeset[action].node) {
          nodes = nodes.concat(changeset[action].node);
        }
        ['node', 'way', 'relation'].forEach(function(entity) {
            var raw = changeset[action][entity];
            if(raw){
              if(!Array.isArray(raw)){
                numChanges += 1;
              }else{
                numChanges += raw.length;
              }
            }

        });
      });

      var bbox = new BoundingBox.FromNodes(nodes).toScaled();

      var newChangeset = {
        min_lon: bbox.minLon | 0,
        min_lat: bbox.minLat | 0,
        max_lon: bbox.maxLon | 0,
        max_lat: bbox.maxLat | 0,
        closed_at: new Date(),
        num_changes: numChanges
      };
      return newChangeset;
    }

};
