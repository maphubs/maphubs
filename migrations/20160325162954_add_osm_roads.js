var lineStyles = require('../data/styles/openstreetmap/line-styles.js');

var roadDefinitions = require('../data/styles/openstreetmap/roads.json');

var buildLayerFromStyle = function(style, legend, knex){
  return {
    name: style.name,
    description: style.name + ': Data from http://www.openstreetmap.org/',
    owned_by_group_id: 'OpenStreetMap',
      published: true,
      style,
      legend_html: legend,
      status: 'published',
      is_external: true,
      external_layer_type: 'openstreetmap',
      external_layer_config: JSON.stringify({type: 'openstreetmap'}),
      presets: [],
      data_type: style.data_type,
      extent_bbox: JSON.stringify([-180, -180, 180, 180]),
      preview_position: JSON.stringify({zoom: 1, lat: 0, lng: 0}),
      source: 'Mapzen/OpenStreetMap Contributors',
      license: 'odc-odbl',
      created_by_user_id: 1,
      creation_time: knex.raw('now()'),
      updated_by_user_id: 1,
      last_updated: knex.raw('now()')
  };
};

exports.up = function(knex, Promise) {

  var commands = [];
  //Add Road Layers
  Object.keys(roadDefinitions).forEach(function(key){
    var stylefDef = roadDefinitions[key];
    var style = lineStyles.getStyle(stylefDef.tag, stylefDef.name, stylefDef.color, stylefDef.layer, stylefDef.filterTag, stylefDef.filterValues, stylefDef.width);
    var legend = lineStyles.getLegend(stylefDef.data_type, stylefDef.name, stylefDef.color);
    var layer = buildLayerFromStyle(style, legend, knex);
    commands.push(knex('omh.layers').insert(layer));
  });
  return Promise.all(commands);

};

exports.down = function(knex, Promise) {
  return true;
};
