//var config = require('../clientconfig');

var updateStyle = function(style){
  if(style && style.sources){
    Object.keys(style.sources).map(function(key) {
      var source = style.sources[key];
      var type = source.type;
      if(key != 'osm' && (type === 'vector' || type === 'raster') && source.url && !source.url.startsWith('mapbox://')  ){
        console.log('Before: ' + source.url);
        source.url = source.url.replace('https://maphubs.com', '{MAPHUBS_DOMAIN}');
        console.log('After: ' +source.url);
        style.sources[key].url = source.url;
      }
    });
  }
return style;

};

exports.up = function(knex, Promise) {
  return Promise.all([
      knex('omh.layers').select('layer_id', 'style'),
      knex('omh.maps').select('map_id', 'style'),
      knex('omh.hubs').select('hub_id', 'map_style'),
      knex('omh.map_layers').select('map_id', 'layer_id', 'style'),
      knex('omh.hub_layers').select('hub_id', 'layer_id', 'style')
   ])
  .then(function(results){
    var layers = results[0];
    var maps = results[1];
    var hubs = results[2];
    var mapLayers = results[3];
    var hubLayers = results[4];

    var updateCommands = [];
    layers.forEach(function(layer){
      var style = updateStyle(layer.style);
      updateCommands.push(knex('omh.layers').update({style}).where({layer_id: layer.layer_id}));
    });
    maps.forEach(function(map){
      var style = updateStyle(map.style);
      updateCommands.push(knex('omh.maps').update({style}).where({map_id: map.map_id}));
    });
    hubs.forEach(function(hub){
      var style = updateStyle(hub.map_style);
      updateCommands.push(knex('omh.hubs').update({map_style: style}).where({hub_id: hub.hub_id}));
    });
    mapLayers.forEach(function(mapLayer){
      var style = updateStyle(mapLayer.style);
      updateCommands.push(knex('omh.map_layers').update({style})
      .where({map_id: mapLayer.map_id, layer_id: mapLayer.layer_id}));
    });
    hubLayers.forEach(function(hubLayer){
      var style = updateStyle(hubLayer.style);
      updateCommands.push(knex('omh.hub_layers').update({style})
      .where({hub_id: hubLayer.hub_id, layer_id: hubLayer.layer_id}));
    });

    return Promise.all(updateCommands);
  });
};

exports.down = function(knex, Promise) {

};
