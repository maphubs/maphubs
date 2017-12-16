// @flow
const debug = require('../services/debug')('layer-data');
const SearchIndex = require('./search-index');
const log = require('../services/log');
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
  async createFeature(layer_id: number, geojson: Object, trx: any): Promise<string>{
    const _this = this;
    debug.log('creating feature');
    
    const result = await trx(`layers.data_${layer_id}`)
    .insert({
      mhid: trx.raw(`${layer_id} || ':' || nextval('layers.mhid_seq_${layer_id}')`),
      wkb_geometry: trx.raw(`ST_SetSRID(ST_GeomFromGeoJSON( :geom ),4326)::geometry(Geometry,4326)`, {geom: JSON.stringify(geojson.geometry)}),
      tags: JSON.stringify(geojson.properties)
    }).returning('mhid');

    if(result && result[0]){
      const mhid = result[0];
      debug.log(`created: ${mhid}`);
      await _this.updateLayerExtent(layer_id, trx);
      try{
        await SearchIndex.updateFeature(layer_id, mhid, true, trx);
        return mhid;
      }catch(err){
        log.error(err);
        return mhid;
      }
    }else{
      return null;
    }
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
  async updateFeature(layer_id: number, mhid: string, geojson: Object, trx: any): Bluebird$Promise<Object>{
    const _this = this;
    debug.log('updating feature: ' + mhid);

    await trx(`layers.data_${layer_id}`)
    .update({
      wkb_geometry: trx.raw('ST_SetSRID(ST_GeomFromGeoJSON( :geom ), 4326)::geometry(Geometry,4326)', {geom: JSON.stringify(geojson.geometry)}),
      tags: JSON.stringify(geojson.properties)
    })
    .where({mhid});

    await _this.updateLayerExtent(layer_id, trx);
    return SearchIndex.updateFeature(layer_id, mhid, true, trx).catch(err =>{
      log.error(err);
    });
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
  async setStringTag(layer_id: number, mhid: string, tag: string, val: ?string, trx: any): Bluebird$Promise<Object>{
    debug.log('updating tag: ' + mhid);
    let valStr;
    if(val){  
      valStr = `"${val}"`;
    }else{
      valStr = 'null';
    }
    const tagStr = `{${tag}}`;
    await trx(`layers.data_${layer_id}`)
    .update({
      tags: trx.raw(`jsonb_set(tags, :tag , :val ::jsonb)`, {tag: tagStr, val: valStr})
    })
    .where({mhid});

    return SearchIndex.updateFeature(layer_id, mhid, true, trx).catch(err =>{
      log.error(err);
    });

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
  async setNumberTag(layer_id: number, mhid: string, tag: string, val: number, trx: any): Bluebird$Promise<Object>{
    debug.log('updating tag: ' + mhid);
    let valStr;
    if(val){
      valStr = `${val}`;
    }else{
      valStr = 'null';
    }
    const tagStr = `{${tag}}`;
    await trx(`layers.data_${layer_id}`)
    .update({
      tags: trx.raw(`jsonb_set(tags, :tag , :val ::jsonb)`, {tag: tagStr, val: valStr})
    })
    .where({mhid});

    return SearchIndex.updateFeature(layer_id, mhid, true, trx).catch(err =>{
      log.error(err);
    });
  },

  /**
   * Delete a layer feature
   * 
   * @param {integer} layer_id
   * @param {text} mhid
   * @param {any} trx
   * @returns Promise
   */
  async deleteFeature(layer_id: number, mhid: string, trx: any): Bluebird$Promise<Object>{
    debug.log('deleting feature: ' + mhid);
    await trx(`layers.data_${layer_id}`).where({mhid}).del();
    return SearchIndex.deleteFeature(mhid);
  },

  async updateLayerExtent(layer_id: number, trx: any){    
    const layerTable = 'layers.data_' + layer_id; 
    let bbox = await trx.raw(`select 
          '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox 
          from (select ST_Extent(wkb_geometry) as bbox from ${layerTable}) a`);

    bbox = bbox.rows[0].bbox;
    debug.log(`updating layer extent: ${layer_id} - ${bbox}`);
    return trx('omh.layers').where({layer_id}).update({extent_bbox: bbox});
  }

};