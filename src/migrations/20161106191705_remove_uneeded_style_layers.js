var updateStyle = function(style, maphubsLayer){
  if(style && Array.isArray(style.layers) && style.layers.length > 0){
    var updatedLayers = [];
    style.layers.map(function(layer){
      if(layer.id === 'omh-data-polygon-' + maphubsLayer.layer_id
      && maphubsLayer.data_type !== 'polygon'){
        console.log("type: " + maphubsLayer.data_type  +" removing: " + layer.id);
      }
      else if(layer.id === 'omh-data-doublestroke-polygon-' + maphubsLayer.layer_id
        && maphubsLayer.data_type !== 'polygon'){
        console.log("type: " + maphubsLayer.data_type  +" removing: " + layer.id);
      }
      else if(layer.id === 'omh-data-outline-polygon-' + maphubsLayer.layer_id
        && maphubsLayer.data_type !== 'polygon'){
        console.log("type: " + maphubsLayer.data_type  +" removing: " + layer.id);
      }
      else if(layer.id === 'omh-hover-polygon-' + maphubsLayer.layer_id
        && maphubsLayer.data_type !== 'polygon'){
        console.log("type: " + maphubsLayer.data_type  +" removing: " + layer.id);
      }else if(layer.id === 'omh-data-line-' + maphubsLayer.layer_id
        && maphubsLayer.data_type !== 'line'){
        console.log("type: " + maphubsLayer.data_type  +" removing: " + layer.id);
      }else if(layer.id === 'omh-hover-line-' + maphubsLayer.layer_id
        && maphubsLayer.data_type !== 'line'){
        console.log("type: " + maphubsLayer.data_type  +" removing: " + layer.id);
      }else if(layer.id === 'omh-data-point-' + maphubsLayer.layer_id
        && maphubsLayer.data_type !== 'point'){
        console.log("type: " + maphubsLayer.data_type  +" removing: " + layer.id);
      }else if(layer.id === 'omh-hover-point-' + maphubsLayer.layer_id
        && maphubsLayer.data_type !== 'point'){
        console.log("type: " + maphubsLayer.data_type  +" removing: " + layer.id);
      }
      else {
        //keep everthing else!
        updatedLayers.push(layer);
      }

    });
    style.layers = updatedLayers;
  }
return style;

};

exports.up = function(knex, Promise) {
  return Promise.all([
      knex('omh.layers').select('layer_id', 'style', 'data_type')
   ])
  .then(function(results){
    var layers = results[0];

    //note, only updating layer styles, maps/hubs/etc combine layers and it would be tricky to split everything back out...
    var updateCommands = [];
    layers.forEach(function(layer){
      var style = updateStyle(layer.style, layer);
      updateCommands.push(knex('omh.layers').update({style}).where({layer_id: layer.layer_id}));
    });
    return Promise.all(updateCommands);
  });
};

exports.down = function(knex, Promise) {

};
