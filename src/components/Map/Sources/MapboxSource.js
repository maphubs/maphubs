var request = require('superagent-bluebird-promise');
var MapboxSource = {
  load(key, source, map, mapComponent){
    var mapboxid = source.mapboxid;
    var url = 'https://api.mapbox.com/styles/v1/' + mapboxid + '?access_token=' + MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN;
    return request.get(url)
        .then(function(res) {
          var mbstyle = res.body;
          mapComponent.mbstyle = mbstyle;

          //TODO: not sure if it is possible to combine sprites/glyphs sources yet, so this doesn't work with all mapbox styles

          //add sources
          Object.keys(mbstyle.sources).forEach(function(key) {
            var source = mbstyle.sources[key];   
            /*        
            map.on('source.load', function(e) {
              if (e.source.id === key && this.state.allowLayersToMoveMap) {
                //map.flyTo({center: mbstyle.center, zoom:mbstyle.zoom});
              }
            });
            */
            map.addSource(key, source);
          });
        });
  },
  addLayer(layer, source, map){
    this.mbstyle.layers.forEach(function(mbStyleLayer){
      if(mbStyleLayer.type !== 'background'){ //ignore the Mapbox Studio background layer
        map.addLayer(mbStyleLayer);
      }
    });
  },
  removeLayer(layer, map){
     this.mbstyle.layers.forEach(function(mbStyleLayer){
      map.removeLayer(mbStyleLayer.id);
    });
  },
  remove(key, map){
    Object.keys(this.mbstyle.sources).forEach(function(mbstyleKey) {
      map.removeSource(mbstyleKey);
    });
  }
};

module.exports = MapboxSource;