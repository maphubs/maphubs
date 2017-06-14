// @flow
var knex = require('../connection.js');
var Promise = require('bluebird');
var log = require('../services/log');

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

    }

};
