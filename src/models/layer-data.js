// @flow
var debug = require('../services/debug')('layer-data');
var knex = require('../connection.js');

/**
 * Provides CRUD methods for updating layer data in PostGIS
 */
module.exports = {

  /**
   * Create a new feature in a layer
   * 
   * @param {any} layer_id
   * @param {any} geojson valid GeoJSON Feature with geometry and properties
   * @param {any} trx
   * @returns Promise
   */
  createFeature(layer_id: number, geojson: Object, trx: any): Bluebird$Promise<Object>{
    debug('creating feature');
    let db = knex; if(trx){db = trx;}
    return db.raw(`INSERT INTO layers.data_${layer_id} (mhid, wkb_geometry, tags)
    VALUES ( ${layer_id} || ':' || nextval(layers.mhid_seq_${layer_id}), 
    ST_GeomFromGeoJSON('${JSON.stringify(geojson.geometry)}'),
    '${JSON.stringify(geojson.properties)}'::jsonb
    `);
  },

  /**
   * Update a layer feature
   * 
   * @param {any} layer_id
   * @param {any} mhid
   * @param {any} geojson valid GeoJSON Feature with geometry and properties
   * @param {any} trx
   * @returns Promise
   */
  updateFeature(layer_id: number, mhid: string, geojson: Object, trx: any): Bluebird$Promise<Object>{
    debug('updating feature: ' + mhid);
    let db = knex; if(trx){db = trx;}
    return db.raw(`UPDATE layers.data_${layer_id}
    SET wkb_geometry = ST_GeomFromGeoJSON('${JSON.stringify(geojson.geometry)}'
    tags = '${JSON.stringify(geojson.properties)}'::jsonb
    WHERE mhid = '${mhid}';
    `);
  },

  /**
   * Delete a layer feature
   * 
   * @param {integer} layer_id
   * @param {text} mhid
   * @param {any} trx
   * @returns Promise
   */
  deleteFeature(layer_id: number, mhid: string, trx: any): Bluebird$Promise<Object>{
    debug('deleting feature: ' + mhid);
    let db = knex; if(trx){db = trx;}
    return db.raw(`delete from layers.data_${layer_id} where mhid='${mhid}'`);
  }

};