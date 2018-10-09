global.MAPHUBS_CONFIG = require('../local')

var updatePlanetConfig = function (elc) {
  if (elc.layers) {
    // new multi-layer config
    elc.layers = elc.layers.map(layer => {
      let sceneArr = layer.planet_labs_scene.split(':')
      let type = sceneArr[0].trim()
      let scene = sceneArr[1].trim()
      var url = `https://tiles.planet.com/data/v1/${type}/${scene}/{z}/{x}/{y}.png?api_key=${MAPHUBS_CONFIG.PLANET_LABS_API_KEY}`
      layer.tiles = [url]
      return layer
    })
  } else {
    let scene = elc.planet_labs_scene
    var url = `https://tiles.planet.com/data/v1/PSOrthoTile/${scene}/{z}/{x}/{y}.png?api_key=${MAPHUBS_CONFIG.PLANET_LABS_API_KEY}`
    elc.tiles = [url]
  }
  return elc
}

exports.up = function (knex, Promise) {
  return knex('omh.layers').select('layer_id', 'external_layer_config', 'style')
    .where({external_layer_type: 'Planet Labs'})
    .then((layers) => {
      var updateCommands = []
      layers.forEach(layer => {
        let elc = updatePlanetConfig(layer.external_layer_config)
        updateCommands.push(knex('omh.layers').update({external_layer_config: elc}).where({layer_id: layer.layer_id}))
      })
      return Promise.all(updateCommands)
    })
}

exports.down = function () {
  return Promise.resolve()
}
