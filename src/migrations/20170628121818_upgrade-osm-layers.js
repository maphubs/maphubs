
exports.up = function(knex, Promise) {
  return knex('omh.layers')
  .select('layer_id', 'name', 'style')
  .where({owned_by_group_id: 'OpenStreetMap'})
  .then(layers => {
    var updateCommands = [];
    layers.forEach(layer => {
      let style = layer.style;
      let name = layer.name;

      style.layers.forEach(styleLayer =>{
          if(layer.layer_id >= 24){ //roads             
            styleLayer.filter[1][1] = 'kind_detail';
            style.sources.osm.tiles = ['https://tile.mapzen.com/mapzen/vector/v1/roads/{z}/{x}/{y}.mvt?api_key=vector-tiles-ltPfkfo'];

          }else if(layer.layer_id === 1){ //buildings
            style.sources.osm.tiles = ['https://tile.mapzen.com/mapzen/vector/v1/buildings/{z}/{x}/{y}.mvt?api_key=vector-tiles-ltPfkfo'];

          }else if(layer.layer_id === 2){ //park
            styleLayer.filter[1].push('natural_park');
            style.sources.osm.tiles = ['https://tile.mapzen.com/mapzen/vector/v1/landuse/{z}/{x}/{y}.mvt?api_key=vector-tiles-ltPfkfo'];

          }else if(layer.layer_id === 3){ //wood
            styleLayer.filter[1].push('natural_wood');
            styleLayer.filter[1].push('forest');
            styleLayer.filter[1].push('natural_forest');
            name.en = 'Forest/ Wood Areas - OpenStreetMap'; 
            style.sources.osm.tiles = ['https://tile.mapzen.com/mapzen/vector/v1/landuse/{z}/{x}/{y}.mvt?api_key=vector-tiles-ltPfkfo'];

          }else{
            //everything else is landuse
            style.sources.osm.tiles = ['https://tile.mapzen.com/mapzen/vector/v1/landuse/{z}/{x}/{y}.mvt?api_key=vector-tiles-ltPfkfo'];
          }
      });

      updateCommands.push(knex('omh.layers').update({style, name}).where({layer_id: layer.layer_id}));

    });
    return Promise.all(updateCommands);
  });
};

exports.down = function() {
  
};
