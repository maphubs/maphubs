var polygonStyles = require('../data/styles/openstreetmap/polygon-styles.js')
var buildings = require('../data/styles/openstreetmap/buildings.json')
var landuseDefinitions = require('../data/styles/openstreetmap/landuse.json')

var buildLayerFromStyle = function (style, legend, knex) {
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
  }
}

exports.up = function (knex, Promise) {
  return knex.raw(`
    INSERT INTO omh.groups (group_id, name, description, location, published)
    VALUES ('OpenStreetMap',
        'OpenStreetMap',
        'http://www.openstreetmap.org/',
        'Global',
    	TRUE
    	);
    `).then(() => {
    return knex.raw(`
        INSERT INTO omh.group_memberships (group_id, user_id, role)
        VALUES ('OpenStreetMap', 1, 'Administrator');
        `).then(() => {
      var commands = []
      // Add Buildings
      var legend = polygonStyles.getLegend(buildings.data_type, buildings.name, 'red')
      var layer = buildLayerFromStyle(buildings, legend, knex)
      commands.push(knex('omh.layers').insert(layer))

      // Add Landuse Layers
      Object.keys(landuseDefinitions).forEach((key) => {
        var stylefDef = landuseDefinitions[key]
        var style = polygonStyles.getStyle(stylefDef.tag, stylefDef.name, stylefDef.color, stylefDef.outlineColor, stylefDef.layer, stylefDef.kinds)
        var legend = polygonStyles.getLegend(stylefDef.data_type, stylefDef.name, stylefDef.color)
        var layer = buildLayerFromStyle(style, legend, knex)
        commands.push(knex('omh.layers').insert(layer))
      })
      return Promise.all(commands)
    })
  })
}

exports.down = function (knex) {
  return knex.raw(`DELETE FROM omh.layer_views
    WHERE layer_id IN (select layer_id FROM omh.layers WHERE owned_by_group_id = 'OpenStreetMap')`)
    .then(() => {
      return knex.raw(`DELETE FROM omh.layers WHERE owned_by_group_id = 'OpenStreetMap'`)
        .then(() => {
          return knex.raw(`DELETE FROM omh.group_memberships WHERE group_id = 'OpenStreetMap'`)
            .then(() => {
              return knex.raw(`DELETE FROM omh.groups WHERE group_id = 'OpenStreetMap'`)
            })
        })
    })
}
