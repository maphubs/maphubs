
exports.up = function(knex, Promise) {
  return knex('omh.layers').select('layer_id', 'style', 'settings').then((layers) => {
    let commands = [];
    layers.forEach((layer) => {
      if(layer.style && layer.settings){
        if(!layer.style.metadata){
          layer.style.metadata = {};
        }
        layer.style.metadata['maphubs:active'] = true;
        if(layer.settings.color){
          layer.style.metadata['maphubs:color'] = layer.settings.color;
        }
        layer.style.metadata['maphubs:interactive'] = layer.settings.interactive;
        layer.style.metadata['maphubs:showBehindBaseMapLabels'] = layer.settings.showBehindBaseMapLabels;

        commands.push(knex('omh.layers').update({style: layer.style}).where({layer_id: layer.layer_id}));
      }
    });
    return Promise.all(commands);

  });
};

exports.down = function() {
  
};
