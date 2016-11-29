// @flow
var Promise = require('bluebird');
var debug = require('./debug')('query-nodes');

module.exports = function queryNodes(knex: any) {

  debug('Query Nodes');


var selectNodes = knex.select('current_nodes.*', 'users.display_name as user', 'users.id as uid')
    .from('current_nodes')
    .join('bboxquerytempnodes', 'current_nodes.id', 'bboxquerytempnodes.id')
    .leftJoin('changesets', 'current_nodes.changeset_id', 'changesets.id')
    .leftJoin('users', 'changesets.user_id', 'users.id');

    var selectNodeTags = knex('current_node_tags')
        .join('bboxquerytempnodes', 'current_node_tags.node_id', 'bboxquerytempnodes.id');

  return Promise.all([
    selectNodes,
    selectNodeTags
  ])
  .then(function (results) {
    var nodes = results[0];
    var nodeTags = results[1];
    debug('Selected Nodes: ' + nodes.length);
    debug('Selected NodeTags: ' + nodeTags.length);

    // attach associated nodes and tags
    nodes.forEach(function (node) {
      node.tags = nodeTags.filter(function(tag) {
        return tag.node_id === node.id;
      });
    });

      var result = {
        ways: [],
        waynodes: [],
        members: [],
        nodes,
        waytags: [],
        nodeTags,
        relations: [],
        relationtags: []
      };
      debug('returning result');
      return result;
  });

};
