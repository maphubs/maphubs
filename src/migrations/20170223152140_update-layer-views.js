var layerViews = require('../services/layer-views');
exports.up = function(knex, Promise) {
  return knex('omh.layers')
  .select('layer_id', 'presets', 'data_type')
  .where({status:'published', is_external: false, remote: false})
  .then((layers) => {
     var commands = [];
     layers.forEach((layer) => {
        var layer_id = layer.layer_id;
        commands.push(
          layerViews.replaceViews(layer_id, layer.presets, knex)      
        );
     });
     return Promise.all(commands);
  });

};

exports.down = function() {
  
};
