/* @flow weak */
//Note: do not enable flow so we can use this in knex migrations for now without involving babel
const knex = require('../connection.js');
const Promise = require('bluebird');
const debug = require('./debug')('layer-views');
const log = require('./log');

module.exports = {

  replaceViews(layer_id, presets, trx){
    debug.log("replace views for layer: " + layer_id);
    const _this = this;
    return _this.dropLayerViews(layer_id, trx)
    .then(() => {
      return _this.createLayerViews(layer_id, presets, trx);
    }).catch((err) =>{
       log.error(err.message);
       throw err;
    });
  },

  dropLayerViews(layer_id, trx = null){
    debug.log("drop views for layer: " + layer_id);
    let db = knex;
    if(trx){db = trx;}
    const commands = [
      `DROP VIEW IF EXISTS layers.centroids_${layer_id}`,
      `DROP VIEW IF EXISTS layers.data_full_${layer_id}`
    ];

    return Promise.each(commands, (command) => {
      return db.raw(command).catch((err) => {
        log.error(err.message); //don't propagate errors in case we are recovering from a incomplete layer
      });
    }).catch((err) =>{
       log.error(err.message);
       throw err;
    });
  },

  createLayerViews(layer_id, presets, trx = null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.layers').select('data_type').where({layer_id})
    .then(result => {
      const dataType = result[0].data_type;

      debug.log(`create views for layer: ${layer_id}`);
      let tagColumns = '';
      if(presets){
        presets.forEach((preset) => {
          if(preset.type === 'number'){
            tagColumns += `CASE WHEN isnumeric(tags->>'${preset.tag}') THEN (tags->>'${preset.tag}')::double precision ELSE NULL END as "${preset.tag}",`;
          }else{
            tagColumns += `(tags->>'${preset.tag}')::text as "${preset.tag}",`;
          }
        });
      }

      const commands = [
      
        `CREATE OR REPLACE VIEW layers.data_full_${layer_id} AS
        SELECT
        mhid, ${layer_id}::integer as layer_id, ST_Force2D(ST_Transform(wkb_geometry, 900913))::geometry(Geometry, 900913) as geom,`
        + tagColumns +
        ` tags FROM layers.data_${layer_id}
        ;`
      ];

      if(dataType === 'polygon'){
        commands.push(
          `CREATE OR REPLACE VIEW layers.centroids_${layer_id} AS
        SELECT
        st_centroid(geom)::geometry(Point,900913) as centroid, * 
        FROM layers.data_full_${layer_id};`
        );
      }

    return Promise.each(commands, (command) => {
      return db.raw(command);
    }).catch((err) =>{
       log.error(err.message);
       throw err;
    });
    });
  }
};
