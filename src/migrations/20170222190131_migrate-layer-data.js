var layerViews = require('../services/layer-views');
exports.up = function(knex, Promise) {
  return knex('omh.layers')
  .select('layer_id', 'presets', 'data_type')
  .where({status:'published', is_external: false, remote: false})
  .then((layers) => {
    return knex('current_nodes').max('id')
    .then((maxResult) => {
     var max = parseInt(maxResult[0].max) + 1;
     var commands = [];
     layers.forEach((layer) => {
       var type = layer.data_type;
        var layer_id = layer.layer_id;
        commands.push(
          knex.raw(`CREATE TABLE layers.data_${layer_id} AS 
          SELECT layer_id || ':' || osm_id as mhid, 
          ST_Transform(geom, 4326)::geometry(Geometry, 4326) as wkb_geometry, 
          ((row_to_json(row)::jsonb) - 'geom') - 'tags' as tags 
          FROM layers.${type}s_${layer_id} row;`)
          .then(() => {
              return knex.raw(`CREATE INDEX data_${layer_id}_wkb_geometry_geom_idx
                ON layers.data_${layer_id}
                USING gist
                (wkb_geometry);`)
              .then(() => {               
                  return knex.raw(`CREATE SEQUENCE layers.mhid_seq_${layer_id} START ${max}`)
                  .then(() => {  
                    if(layer.data_type === 'polygon'){
                      return knex.raw(`DROP VIEW layers.centroids_${layer_id}`)
                    .then(() => {  
                      return layerViews.createLayerViews(layer_id, layer.presets, knex);
                     });
                    }else{
                      return layerViews.createLayerViews(layer_id, layer.presets, knex);
                    }
                  });
              });
          })
        );
     });
     return Promise.all(commands);
   });
  });

};

exports.down = function() {
  
};
