var layerViews = require('../services/layer-views');

exports.up = function(knex, Promise) {
  return knex.raw("alter table omh.feature_photo_attachments alter column osm_id type varchar(255) using osm_id::varchar")
  .then(() => {
    return knex.raw("alter table omh.feature_notes alter column osm_id type varchar(255) using osm_id::varchar")
    .then(() => {
      return knex('omh.layers').select('layer_id', 'presets', 'data_type').where({status:'published', is_external: false, remote: false})
      .then((results) => {
        var updates = [];
        results.forEach((layer) => {
          updates.push(layerViews.replaceViews(layer.layer_id, layer.presets, knex));
          if(layer.data_type === 'point'){
            updates.push(knex.raw("UPDATE omh.feature_photo_attachments SET osm_id = 'n' || osm_id where layer_id="+layer.layer_id));
            updates.push(knex.raw("UPDATE omh.feature_notes SET osm_id = 'n' || osm_id where layer_id="+layer.layer_id));
          }else if(layer.data_type === 'line'){
            updates.push(knex.raw("UPDATE omh.feature_photo_attachments SET osm_id = 'w' || osm_id where layer_id="+layer.layer_id));
            updates.push(knex.raw("UPDATE omh.feature_notes SET osm_id = 'w' || osm_id where layer_id="+layer.layer_id));
          }else if(layer.data_type === 'polygon'){
            updates.push(knex.raw("UPDATE omh.feature_photo_attachments SET osm_id = 'p' || osm_id where layer_id="+layer.layer_id));
            updates.push(knex.raw("UPDATE omh.feature_notes SET osm_id = 'p' || osm_id where layer_id="+layer.layer_id));
          }
        });
        return Promise.all(updates);
      });
    });
  });
};

exports.down = function() {

};
