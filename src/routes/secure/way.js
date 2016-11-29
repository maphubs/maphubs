// @flow
var _forEach = require('lodash.foreach');
var knex = require('../../connection.js');
var queryWays = require('../../services/query-ways.js');
var XML = require('../../services/xml.js');
var Node = require('../../models/node-model.js');
var log = require('../../services/log.js');

function serveSingleWay(req, res, next) {
  var wayId = parseInt(req.params.wayId || '', 10);
  if (!wayId || isNaN(wayId)) {
      res.send(400, {error: 'Way ID must be a non-zero number'});
  }
  return knex.transaction(function(trx) {
    return trx.raw(`
      CREATE TEMP TABLE bboxquerytempnodes AS
        SELECT distinct id FROM current_nodes
        JOIN current_way_nodes on current_nodes.id = current_way_nodes.node_id
        WHERE way_id = `+ wayId
    ).then(function(){
      return trx.raw('CREATE UNIQUE INDEX bboxquerytempnodes_idx ON bboxquerytempnodes (id)')
      .then(function(){
        return queryWays(trx, null)
        .then(function (result) {
          var xmlDoc = XML.write({
            nodes: Node.withTags(result.nodes, result.nodetags, 'node_id'),
            ways: Node.withTags(result.ways, result.waytags, 'way_id')
          });
                res.header("Content-Type", "text/xml");
                res.send(xmlDoc.toString());
        })
        .then(function(result){
          return trx.raw('DROP TABLE bboxquerytempnodes').then(function(){
            return result;
          });
        });
      });
    });
  })
  .catch(function (err) {
    log.error(err);
          next(err);
  });
}

function serveWays(req, res, next) {
  var wayIds = req.params.wayIds.split(',');

  _forEach(wayIds, function (wayId) {
    if (!wayId || isNaN(wayId)) {
        res.send(400, {error: 'Way ID must be a non-zero number'});
    }
  });

  return knex.transaction(function(trx) {
    return trx.raw(`
      CREATE TEMP TABLE bboxquerytempnodes AS
        SELECT distinct id FROM current_nodes
        JOIN current_way_nodes on current_nodes.id = current_way_nodes.node_id
        WHERE way_id in (`+ wayIds.join(',') + `)`
    ).then(function(){
      return trx.raw('CREATE UNIQUE INDEX bboxquerytempsnode_idx ON bboxquerytempnodes (id)')
      .then(function(){
        return queryWays(trx, null)
            .then(function (result) {
              var xmlDoc = XML.write({
                nodes: Node.withTags(result.nodes, result.nodetags, 'node_id'),
                ways: Node.withTags(result.ways, result.waytags, 'way_id')
              });
                res.header("Content-Type", "text/xml");
                res.send(xmlDoc.toString());
            })
        .then(function(result){
          return trx.raw('DROP TABLE bboxquerytempnodes').then(function(){
            return result;
          });
        });
      });
    });
  }).catch(function (err) {
        log.error(err);
          next(err);
      });
}


module.exports = function(app: any) {
    app.get('/api/0.6/way/:wayId/full', serveSingleWay);
    app.get('/api/0.6/way/:wayId', serveSingleWay);
    app.get('/api/0.6/ways/:wayIds', serveWays);
};
