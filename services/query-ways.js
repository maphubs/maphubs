/* @flow weak */
var _map = require('lodash.map');
var _uniq = require('lodash.uniq');
var Promise = require('bluebird');
var queryNodes = require('./query-nodes');
var debug = require('./debug')('query-ways');

module.exports = function queryWays(knex, layer_id) {

  // Query the desired ways and any way_nodes that are in those ways
  // Also query any relations that those ways are a part of.

  // #TODO:250 this currently does not query nodes that are part of relations,
  // or other relations that are part of relations.


  var selectWays =  knex.select('current_ways.*', 'users.display_name as user', 'users.id as uid')
    .distinct('current_ways.id as uniqueid')
    .from('current_ways')
    .join('current_way_nodes', 'current_ways.id', 'current_way_nodes.way_id')
    .join('bboxquerytemp', 'current_way_nodes.node_id', 'bboxquerytemp.id')
    .leftJoin('changesets', 'current_ways.changeset_id', 'changesets.id')
    .leftJoin('users', 'changesets.user_id', 'users.id');

  if(layer_id){
    selectWays = selectWays.where('current_ways.layer_id',layer_id);
  }

  var selectWayNodes =  knex('current_way_nodes')
    .distinct('node_id AS id')
    .select('way_id', 'sequence_id')
    .join('bboxquerytemp', 'current_way_nodes.node_id', 'bboxquerytemp.id')
    .orderBy('way_id', 'asc')
    .orderBy('sequence_id', 'asc');


 var selectWayTags =  knex('current_way_tags')
   .distinct('current_way_tags.way_id', 'k', 'v')
   .join('current_way_nodes', 'current_way_tags.way_id', 'current_way_nodes.way_id')
   .join('bboxquerytemp', 'current_way_nodes.node_id', 'bboxquerytemp.id');


 var selectNodes =  knex('current_nodes')
 .select('current_nodes.*', 'users.display_name as user', 'users.id as uid')
   .join('bboxquerytemp', 'current_nodes.id', 'bboxquerytemp.id')
   .leftJoin('changesets', 'current_nodes.changeset_id', 'changesets.id')
   .leftJoin('users', 'changesets.user_id', 'users.id');



var selectNodesTags =  knex('current_node_tags')
  .join('bboxquerytemp', 'current_node_tags.node_id', 'bboxquerytemp.id');


 var selectRelationMembers = knex('current_relation_members')
 .distinct('current_relation_members.relation_id AS id', 'member_id', 'current_relation_members.sequence_id', 'member_role')
  .leftJoin('current_ways', 'current_relation_members.member_id', 'current_ways.id')
  .join('current_way_nodes', 'current_ways.id', 'current_way_nodes.way_id')
  .join('bboxquerytemp', 'current_way_nodes.node_id', 'bboxquerytemp.id')
  .orderBy('current_relation_members.relation_id', 'asc')
  .orderBy('current_relation_members.sequence_id', 'asc')
  .where('current_relation_members.member_type', 'Way');


  var selectRelations = knex('current_relations')
  .distinct('current_relations.id as uniqueid')
  .select('current_relations.*', 'users.display_name as user', 'users.id as uid')
  .leftJoin('current_relation_members', 'current_relations.id', 'current_relation_members.relation_id')
   .join('current_way_nodes', 'current_relation_members.member_id', 'current_way_nodes.way_id')
   .join('bboxquerytemp', 'current_way_nodes.node_id', 'bboxquerytemp.id')
   .leftJoin('changesets', 'current_relations.changeset_id', 'changesets.id')
   .leftJoin('users', 'changesets.user_id', 'users.id')
    .where('current_relation_members.member_type', 'Way');

   var selectRelationTags = knex('current_relation_tags')
   .distinct('current_relation_tags.relation_id', 'k', 'v')
   .leftJoin('current_relation_members', 'current_relation_tags.relation_id', 'current_relation_members.relation_id')
    .leftJoin('current_way_nodes', 'current_relation_members.member_id', 'current_way_nodes.way_id')
    .join('bboxquerytemp', 'current_way_nodes.node_id', 'bboxquerytemp.id')
     .where('current_relation_members.member_type', 'Way');

  return Promise.all([
    selectWays,
    selectWayNodes,
    selectRelationMembers,
    selectNodes,
    selectWayTags,
    selectNodesTags,
    selectRelations,
    selectRelationTags
  ])
  .then(function (resultArr) {
    var result = {
      ways: resultArr[0],
      waynodes: resultArr[1],
      members: resultArr[2],
      nodes: resultArr[3],
      waytags: resultArr[4],
      nodetags: resultArr[5],
      relations: resultArr[6],
      relationtags: resultArr[7]
    };

    // attach associated nodes and tags to ways
    result.ways.forEach(function (way) {
      way.nodes = result.waynodes.filter(function(waynode) {
        return waynode.way_id === way.id;
      });
      way.tags = result.waytags.filter(function(tag) {
        return tag.way_id === way.id;
      });
    });

    result.relations.forEach(function (relation) {
      relation.members = result.members.filter(function(member) {
        return member.relation_id === relation.id;
      });
      relation.tags = result.relationtags.filter(function(tag) {
        return tag.relation_id === relation.id;
      });
    });

    if(result.ways.length > 0){
      debug(result.ways.length + ' Ways Found, returning result');
      return result;
    } else {
      //query nodes
      debug('No Ways Found, running QueryNodes');
      return queryNodes(knex).then(function (nodeResult){
          debug('QueryNodes result: '+ JSON.stringify(nodeResult));
        return nodeResult;
      });
    }

  });

};
