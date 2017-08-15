global.MAPHUBS_CONFIG = require('../clientconfig');

var updatePlanetConfig = function(elc){
  if(elc.layers){
    //new multi-layer config
    elc.layers = elc.layers.map(layer => {
      let sceneArr = layer.planet_labs_scene.split(':');
      let type = sceneArr[0].trim();
      let scene = sceneArr[1].trim();
      var url = `https://tiles.planet.com/data/v1/${type}/${scene}/{z}/{x}/{y}.png?api_key=${MAPHUBS_CONFIG.PLANET_LABS_API_KEY}`;
      layer.tiles = [url];
      return layer;
    });
  }else {
    let scene = elc.planet_labs_scene;
    var url = `https://tiles.planet.com/data/v1/PSOrthoTile/${scene}/{z}/{x}/{y}.png?api_key=${MAPHUBS_CONFIG.PLANET_LABS_API_KEY}`;
    elc.tiles =[url];
    elc.layers = [{
      planet_labs_scene: elc.scene,
      tiles: elc.tiles
    }];
  }
  return elc;
};

var multiRasterStyleWithOpacity = function(layer_id, layers, opacity){
  
      opacity = opacity / 100;
      var style = {
          sources: {},
          layers: []
      };

      layers.forEach((raster, i) => {
        var id = `omh-raster-${i}-${layer_id}`;
        style.layers.push(
          {
            "id": id,
            "type": "raster",
            "source": id,
            "minzoom": 0,
            "maxzoom": 18,
            "paint": {
              "raster-opacity": opacity
            }
            }
        );
        style.sources[id] = {
          type: 'raster',
          tiles: raster.tiles,
          "tileSize": 256

      };
      });

      return style;
    };


exports.up = function(knex, Promise) {
  return knex('omh.layers').select('layer_id', 'external_layer_config', 'style')
  .whereIn('external_layer_type', ['Planet', 'Planet Labs'])
  .then((layers) => {
    var updateCommands = [];
    layers.forEach(layer => {
      let elc = updatePlanetConfig(layer.external_layer_config);
      let style = multiRasterStyleWithOpacity(layer.layer_id, elc.layers);
      updateCommands.push(knex('omh.layers').update({external_layer_config: elc, style}).where({layer_id: layer.layer_id}));
    });
    return Promise.all(updateCommands);
  });
};

exports.down = function() {
  
};
