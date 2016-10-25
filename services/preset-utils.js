/* @flow weak */
var knex = require('../connection.js');
var Promise = require('bluebird');

var _find = require('lodash.find');
var _map = require('lodash.map');

var debug = require('../services/debug')('preset-utils');
var log = require('../services/log');

module.exports = {

  getDefaultPreset(tag){
    return {
      tag,
      label: tag,
      type: 'text',
      isRequired: false,
      values: null
    };
  },


  getIdEditorPresets(layer_id){
    return knex('omh.layers').select('presets', 'data_type', 'name').where({layer_id})
    .then(function(result){
      var layer = result[0];
      var data_type = layer.data_type;

      var customPreset = {
        presets: {},
        fields: {},
        defaults: {},
        categories: {}
      };

      var fieldsList = [];
      layer.presets.forEach(function(preset){

        var presetObject = {
          "key": preset.tag,
          "type": preset.type,
          "label": preset.label ? preset.label : '',
          "placeholder": preset.placeholder ? preset.placeholder : ''
        };

        if((preset.type == 'radio' || preset.type == 'combo') && preset.options){
          var optionsArr = preset.options.split(',');
          optionsArr.map(function(option){
            option = option.trim();
          });
          presetObject.options = optionsArr;
        }
          customPreset.fields[preset.tag.toLowerCase()] = presetObject;

        fieldsList.push(preset.tag.toLowerCase());
      });

      customPreset.presets['layer-' + layer_id] = {
                  "name": layer.name,
                  "tags": {},
                  "fields": fieldsList,
                  "geometry": [],
                  "matchScore": 0.1
              };

      customPreset.defaults = {
        point: [],
        line: [],
        area: [],
        vertex: [],
        relation: []
      };

      if(data_type == 'point'){
        customPreset.presets['layer-' + layer_id].geometry.push("point");
        customPreset.presets['layer-' + layer_id].icon = "";
          customPreset.defaults.point.push('layer-' + layer_id);
      }else if(data_type == 'line'){
        customPreset.presets['layer-' + layer_id].geometry.push("line");
        customPreset.defaults.line.push('layer-' + layer_id);

      }else if(data_type == 'polygon'){
        customPreset.presets['layer-' + layer_id].geometry.push("area");
        customPreset.defaults.area.push('layer-' + layer_id);
      }
      return customPreset;
    });

  },



  renameTag(layer_id, oldTag, newTag){

    var layerRelations = knex.select('id').from('current_relations').where({layer_id});
    var updateRelations =  knex('relation_tags').update({k:newTag})
      .whereIn('relation_id', layerRelations).andWhere({k: oldTag});

    var layerWays = knex.select('id').from('current_ways'). where({layer_id});
    var updateWays =  knex('way_tags').update({k:newTag})
      .whereIn('way_id', layerWays).andWhere({k: oldTag});

    var layerNodes = knex.select('id').from('current_nodes').where({layer_id});
    var updateNodes =  knex('node_tags').update({k:newTag})
    .whereIn('node_id', layerNodes).andWhere({k: oldTag});

    return Promise.all([
      updateRelations, updateWays, updateNodes
    ]);
  },

  //adds any missing tags to the presets
  updatePresets(layer_id, user_id, trx=null) {
    debug("update presets for layer: " + layer_id);
    let db = knex;
    if(trx){db = trx;}
    var _this = this;
    return db('omh.layers').select('presets').where({layer_id})
    .then(function(result){
      var presets = result[0].presets;
      return Promise.all([
        db('current_node_tags').distinct('k')
        .leftJoin('current_nodes', 'current_node_tags.node_id', 'current_nodes.id')
        .where({layer_id}),
        db('current_way_tags').distinct('k')
        .leftJoin('current_ways', 'current_way_tags.way_id', 'current_ways.id')
        .where({layer_id}),
        db('current_relation_tags').distinct('k')
        .leftJoin('current_relations', 'current_relation_tags.relation_id', 'current_relations.id')
        .where({layer_id})
      ]).then(function(results){
        var nodeTags = _map(results[0], 'k');
        var wayTags = _map(results[1], 'k');
        var relationTags = _map(results[2], 'k');
        var allTags = nodeTags.concat(wayTags).concat(relationTags);
        allTags.forEach(function(tag){
          if(!_find(presets, {tag})){
            log.info("adding preset: " + tag + " to layer: "+ layer_id);
            presets.push(_this.getDefaultPreset(tag));
          }
        });
        return db('omh.layers').where({layer_id})
          .update({
              presets: JSON.stringify(presets),
              updated_by_user_id: user_id,
              last_updated: db.raw('now()')
          });
      });

    });

  }




};
