
var fixStyleLayer = function (layer) {
  if (layer.type === 'symbol' &&
    layer.layout && layer.layout['text-font']
  ) {
    var font = layer.layout['text-font']
    console.log(`current font: ${font}`)
    if (font && font[0] === 'Arial Unicode MS Regular') {
      console.log(`replacing with: Roboto Bold`)
      layer.layout['text-font'][0] = 'Roboto Bold'
      return layer
    }
  }
}

exports.up = function (knex, Promise) {
  return knex('omh.maps').select('map_id', 'style')
    .then(maps => {
      return Promise.mapSeries(maps, map => {
      // console.log(`checking map: ${map.map_id}`);
        if (map.style && map.style.layers) {
          var updated
          map.style.layers.forEach((layer, i) => {
            var fixedLayer = fixStyleLayer(layer)
            if (fixedLayer) {
              map.style.layers[i] = fixedLayer
              updated = true
            }
          })
          if (updated) {
            console.log(`updating map: ${map.map_id}`)
            return knex('omh.maps').update({style: map.style}).where({map_id: map.map_id})
          }
        }
      })
    })
    .then(() => {
      return knex('omh.layers').select('layer_id', 'style')
        .then(layers => {
          return Promise.mapSeries(layers, layer => {
            // console.log(`checking layer: ${layer.layer_id}`);
            if (layer.style && layer.style.layers) {
              var updated
              layer.style.layers.forEach((styleLayer, i) => {
                var fixedLayer = fixStyleLayer(styleLayer)
                if (fixedLayer) {
                  layer.style.layers[i] = fixedLayer
                  updated = true
                }
              })
              if (updated) {
                console.log(`updating layer: ${layer.layer_id}`)
                return knex('omh.layers').update({style: layer.style}).where({layer_id: layer.layer_id})
              }
            }
          })
        })
    })
    .then(() => {
      return knex('omh.map_layers').select('layer_id', 'map_id', 'style')
        .then(mapLayers => {
          return Promise.mapSeries(mapLayers, mapLayer => {
            // console.log(`checking layer: ${layer.layer_id}`);
            if (mapLayer.style && mapLayer.style.layers) {
              var updated
              mapLayer.style.layers.forEach((styleLayer, i) => {
                var fixedLayer = fixStyleLayer(styleLayer)
                if (fixedLayer) {
                  mapLayer.style.layers[i] = fixedLayer
                  updated = true
                }
              })
              if (updated) {
                console.log(`updating map-layer: ${mapLayer.map_id}-${mapLayer.layer_id}`)
                return knex('omh.map_layers').update({style: mapLayer.style})
                  .where({
                    map_id: mapLayer.map_id,
                    layer_id: mapLayer.layer_id
                  })
              }
            }
          })
        })
    })
}

exports.down = function (knex, Promise) {
  return Promise.resolve()
}
