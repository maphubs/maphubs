// @flow
var knex = require('../connection.js');
var PresetUtils = require('../services/preset-utils');

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
        //TODO: handle preset changes
        //loop through presets and find any that have:
        //1)changed the tag
        //2) have been deleted (if we want to actually delete them??)

        presets.forEach(function(preset){
          if(preset.prevTag !== undefined){
            PresetUtils.renameTag(layer_id, preset.prevTag, preset.tag);
          }
        });

        //update the Data
        return db('omh.layers').where({
            layer_id
          })
          .update({
              presets: JSON.stringify(presets),
              updated_by_user_id: user_id,
              last_updated: knex.raw('now()')
          });
      }

    }

};
