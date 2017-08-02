/*eslint-disable no-console */
var _forEachRight = require('lodash.foreachright');
var buildMapStyle = function (styles){
     var mapStyle = {
       version: 8,
       sources: {},
       layers: []
     };

     //reverse the order for the styles, since the map draws them in the order recieved
     _forEachRight(styles, (style) => {
       if(style && style.sources && style.layers){
        //add source
        mapStyle.sources = Object.assign(mapStyle.sources, style.sources);
        //add layers
        mapStyle.layers = mapStyle.layers.concat(style.layers);
      }
    });
    return mapStyle;
   };
exports.up = function(knex, Promise) {
  return knex('omh.maps').select('map_id').then(maps=>{
    return Promise.mapSeries(maps, map=>{
      console.log(`updating map: ${map.map_id}`);
      return knex('omh.map_layers')
        .select('layer_id', 'style')
        .where({map_id: map.map_id})
        .then(mapLayers=>{
           console.log(`found ${mapLayers.length} layers`);
          let styles = [];
          mapLayers.forEach(mapLayer=>{
            styles.push(mapLayer.style);
          });
          let mapStyle = buildMapStyle(styles);
          return knex('omh.maps').update({style: mapStyle}).where({map_id: map.map_id});
        });
    });
  });
};

exports.down = function() {
  
};
