var multiRasterStyleWithOpacity = function (layer_id, layers, opacity) {
  opacity = opacity / 100
  var style = {
    sources: {},
    layers: []
  }

  layers.forEach((raster, i) => {
    var id = `omh-raster-${i}-${layer_id}`
    style.layers.push({
      id: id,
      type: 'raster',
      source: id,
      minzoom: 0,
      maxzoom: 18,
      paint: {
        'raster-opacity': opacity
      }
    })
    style.sources[id] = {
      type: 'raster',
      tiles: raster.tiles,
      tileSize: 256
    }
  })
  return style
}

exports.up = function (knex) {
  return knex('omh.layers')
    .select('layer_id', 'external_layer_config', 'style')
    .whereIn('external_layer_type', ['Planet', 'Planet Labs'])
    .then((layers) => {
      var updateCommands = []
      if (layers) {
        layers.forEach((layer) => {
          const style = multiRasterStyleWithOpacity(
            layer.layer_id,
            layer.external_layer_config.layers,
            100
          )
          updateCommands.push(
            knex('omh.layers')
              .update({ style })
              .where({ layer_id: layer.layer_id })
          )
        })
      }
      return Promise.all(updateCommands)
    })
}

exports.down = function () {
  return Promise.resolve()
}
