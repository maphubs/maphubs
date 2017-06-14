
exports.up = function(knex, Promise) {
  return knex('omh.layers').select('layer_id', 'style', 'presets').then(function(layers){
    let commands = [];
    layers.forEach(function(layer){
      if(layer.style && layer.presets){
        Object.keys(layer.style.sources).forEach(function(key){
          if(!layer.style.sources[key].metadata){
            layer.style.sources[key].metadata = {};
          }
          layer.style.sources[key].metadata['maphubs:presets'] = layer.presets;
        });
        commands.push(knex('omh.layers').update({style: layer.style}).where({layer_id: layer.layer_id}));
      }
    });
    return Promise.all(commands);

  });
};

exports.down = function(knex, Promise) {
  
};
