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
  createFeature(layer_id: number, geojson: Object, trx: any): string{
    debug('creating feature');
    let db = knex; if(trx){db = trx;}
    return db.raw(`INSERT INTO layers.data_${layer_id} (mhid, wkb_geometry, tags)
    VALUES ( ${layer_id} || ':' || nextval(layers.mhid_seq_${layer_id}), 
    ST_GeomFromGeoJSON('${JSON.stringify(geojson.geometry)}'),
    '${JSON.stringify(geojson.properties)}'::jsonb) RETURNING mhid;
    `).then(result => {
      if(result.rows && result.rows.length === 1){
        return result.rows[0].mhid;
      }else{
        return null;
      }
    });
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
    SET wkb_geometry = ST_GeomFromGeoJSON('${JSON.stringify(geojson.geometry)}')
    tags = '${JSON.stringify(geojson.properties)}'::jsonb
    WHERE mhid = '${mhid}';
    `);
  },

  /**
   * In place update of string tag
   * 
   * Note: if adding a new tag, it won't show in the map data until
   *  added to the layer presets and the layer views recreated to add the new column
   * 
   * @param {number} layer_id
   * @param {string} mhid
   * @param {string} tag
   * @param {string} val
   * * @param {any} trx
   * @returns {Bluebird$Promise<Object>}
   */
  setStringTag(layer_id: number, mhid: string, tag: string, val: string, trx: any): Bluebird$Promise<Object>{
    debug('updating tag: ' + mhid);
    let db = knex; if(trx){db = trx;}
    var valStr;
    if(val){
      valStr = `"${val}"`;
    }else{
      valStr = 'null';
    }
    return db.raw(`UPDATE layers.data_${layer_id}
    SET tags = jsonb_set(tags, '{${tag}}', '${valStr}'::jsonb)
    WHERE mhid = '${mhid}';
    `);
  },

  /**
   * In place update of number tag
   * 
   * @param {number} layer_id
   * @param {string} mhid
   * @param {string} tag
   * @param {number} val
   * * @param {any} trx
   * @returns {Bluebird$Promise<Object>}
   */
  setNumberTag(layer_id: number, mhid: string, tag: string, val: number, trx: any): Bluebird$Promise<Object>{
    debug('updating tag: ' + mhid);
    let db = knex; if(trx){db = trx;}
    var valStr;
    if(val){
      valStr = `${val}`;
    }else{
      valStr = 'null';
    }
    return db.raw(`UPDATE layers.data_${layer_id}
    SET tags = jsonb_set(tags, '{${tag}}', '${valStr}'::jsonb)
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