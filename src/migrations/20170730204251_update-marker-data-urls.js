/* eslint-disable no-console */
var updateStyle = function (style, layer_id, shortid) {
  if (!style || !style.layers) return style
  style.layers.map(layer => {
    if (layer.metadata && layer.metadata['maphubs:markers'] && layer.metadata['maphubs:layer_id']) {
      const data_layer_id = layer.metadata['maphubs:layer_id']
      if (layer_id === data_layer_id) {
        const markerSettings = layer.metadata['maphubs:markers']
        markerSettings.dataUrl = `{MAPHUBS_DOMAIN}/api/lyr/${shortid}/export/json/${data_layer_id}.json`
        markerSettings.geobufUrl = `{MAPHUBS_DOMAIN}/api/lyr/${shortid}/export/geobuf/${data_layer_id}.pbf`
        layer.metadata['maphubs:markers'] = markerSettings
      }
    }
    return layer
  })
  return style
}

var _forEachRight = require('lodash.foreachright')
var buildMapStyle = function (styles) {
  var mapStyle = {
    version: 8,
    sources: {},
    layers: []
  }

  // reverse the order for the styles, since the map draws them in the order recieved
  _forEachRight(styles, (style) => {
    if (style && style.sources && style.layers) {
      // add source
      mapStyle.sources = Object.assign(mapStyle.sources, style.sources)
      // add layers
      mapStyle.layers = mapStyle.layers.concat(style.layers)
    }
  })
  return mapStyle
}

exports.up = function (knex, Promise) {
  return knex('omh.layers')
    .select('layer_id', 'shortid', 'style')
    .whereNot({is_external: true, remote: true})
    .then(layers => {
      return Promise.map(layers, layer => {
        const updatedStyle = updateStyle(layer.style, layer.layer_id, layer.shortid)
        return knex('omh.layers').update({style: updatedStyle}).where({layer_id: layer.layer_id})
      }).then(() => {
        return knex.raw(`select omh.map_layers.map_id, omh.map_layers.layer_id, 
        omh.map_layers.style as map_layer_style,
        omh.layers.shortid
        from omh.map_layers 
        left join omh.layers on omh.map_layers.layer_id = omh.layers.layer_id
        order by position`)
          .then((result) => {
            const updatedMapStyles = {}
            return Promise.mapSeries(result.rows, mapLayer => {
              console.log(`updating map layer, map:${mapLayer.map_id} layer: ${mapLayer.layer_id}`)
              const mapLayerStyle = updateStyle(mapLayer.map_layer_style, mapLayer.layer_id, mapLayer.shortid)
              if (!updatedMapStyles[mapLayer.map_id]) {
                updatedMapStyles[mapLayer.map_id] = []
              }
              updatedMapStyles[mapLayer.map_id].push(mapLayerStyle)
              return knex('omh.map_layers')
                .update({style: mapLayerStyle})
                .where({map_id: mapLayer.map_id, layer_id: mapLayer.layer_id})
                .then(() => {
                  return updatedMapStyles
                })
            }).then((updatedMapStyles) => {
              return Promise.mapSeries(Object.keys(updatedMapStyles), map_id => {
                console.log(`updating map: ${map_id}`)
                const updatedMapStyle = buildMapStyle(updatedMapStyles[map_id])
                return knex('omh.maps').update({style: updatedMapStyle}).where({map_id})
              })
            })
          })
      })
    })
}

exports.down = function () {
  return Promise.resolve()
}
