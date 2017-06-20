// @flow
var knex = require('../connection.js');
var Promise = require('bluebird');
var log = require('../services/log');
var MapStyles = require('../components/Map/Styles');

module.exports = {

    savePresets(layer_id: number, presets: any, user_id: number, create: boolean, trx: any) {
      let db = knex;
      if(trx){db = trx;}
      if(create){
        //just insert them
        return db('omh.layers').where({
            layer_id
          })
          .update({
              presets: JSON.stringify(presets),
              updated_by_user_id: user_id,
              last_updated: knex.raw('now()')
          });
      } else {
        //look for modified tags(properties) since new need to rename them in the data

        let updateCommands = [];

        presets.forEach((preset) => {
          if(preset.prevTag !== undefined){
            //preset was modified
            updateCommands.push(
            db(`layers.data_${layer_id}`)
            .select(db.raw(`count(tags -> '${preset.prevTag}')`))
            .then(countResult =>{
              if(countResult[0].count === 0){               
                return db.raw(`UPDATE layers.data_${layer_id} SET tags=jsonb_set(tags, '{${preset.tag}}', tags-> '${preset.prevTag}')`);
              }else{
                log.error(`tag: ${preset.prevTag} already exists`);
              }
            })
            );
          }
        });

        if(updateCommands.length > 0){
          return Promise.all(updateCommands)
          .then(() => {

            return db('omh.layers').where({layer_id})
            .update({
                presets: JSON.stringify(presets),
                updated_by_user_id: user_id,
                last_updated: knex.raw('now()')
            });
            });

        }else{
          return db('omh.layers').where({layer_id})
          .update({
              presets: JSON.stringify(presets),
              updated_by_user_id: user_id,
              last_updated: knex.raw('now()')
          });
        }
      }

    },

    updatePresetsInMapStyles(layer_id: number, presets: any){
      return knex.raw(`
        select omh.map_layers.map_id, omh.map_layers .layer_id, 
omh.map_layers.style as map_layer_style,
omh.layers.style as orig_layer_style
from omh.map_layers 
left join omh.layers on omh.map_layers.layer_id = omh.layers.layer_id
where map_id in (SELECT distinct map_id from omh.map_layers where layer_id = ${layer_id})
order by position
      `)
      .then(result => {
        let updatedMapStyles = {};
        let updateCommands = [];
        result.rows.forEach(mapLayer => {
          let mapLayerStyle = mapLayer.map_layer_style;

          //update source metadata
          Object.keys(mapLayerStyle.sources).forEach(function(sourceID){          
            var mapSource =  mapLayerStyle.sources[sourceID];
            if(!mapSource.metadata){
              mapSource.metadata = {};
            }
             mapSource.metadata['maphubs:presets'] = presets;
          });
          
          if(!updatedMapStyles[mapLayer.map_id]){
            updatedMapStyles[mapLayer.map_id] = [];
          }

          updatedMapStyles[mapLayer.map_id].push({
            layer_id: mapLayer.layer_id,
            style: mapLayerStyle
          });
        
          updateCommands.push(
            knex('omh.map_layers')
            .update({style: mapLayerStyle})
            .where({map_id: mapLayer.map_id, layer_id: mapLayer.layer_id})
          );
    });

    //loop through map_ids, build updated styles, and update
    Object.keys(updatedMapStyles).forEach(map_id => {
      let updatedMapStyle = MapStyles.style.buildMapStyle(updatedMapStyles[map_id]);
      updateCommands.push(
        knex('omh.maps').update({style: updatedMapStyle}).where({map_id: map_id})
      );
    });

    return Promise.all(updateCommands);
  });
    }

};
