// @flow
const knex = require('../connection.js');
const debug = require('../services/debug')('feature');

module.exports = {

  async getFeatureByID(mhid: string, layer_id: number, trx: any) {
    const geojson = await this.getGeoJSON(mhid, layer_id, trx);
    const feature = {geojson};
    const notes = await this.getFeatureNotes(mhid, layer_id, trx);
    return{feature, notes};
  },

  async getFeatureNotes(mhid: string, layer_id: number, trx: any){
    const db = trx ? trx : knex;

    const result = await db('omh.feature_notes').select('notes').where({mhid, layer_id});

    if(result && result.length === 1){
      return result[0];
    }
    return null;
  },

  async saveFeatureNote(mhid: string, layer_id: number, user_id: number, notes: string, trx: any){
    const db = trx ? trx : knex;
    const result = await db('omh.feature_notes').select('mhid').where({mhid, layer_id});

    if(result && result.length === 1){
      return db('omh.feature_notes')
      .update({
        notes,
        updated_by: user_id,
        updated_at: db.raw('now()')
      })
      .where({mhid, layer_id});
    }else{
      return db('omh.feature_notes')
      .insert({
        layer_id,
        mhid,
        notes,
        created_by: user_id,
        created_at: db.raw('now()'),
        updated_by: user_id,
        updated_at: db.raw('now()')
      });
    }
  },

  /**
   * Get GeoJSON for feature(s)
   * 
   * @param {string} mhid 
   * @param {number} layer_id 
   * @returns 
   */
    async getGeoJSON(mhid: string, layer_id: number, trx: any) {
      const db = trx ? trx : knex;
     
      const layerTable = 'layers.data_' + layer_id;  
      const data = await db.select(db.raw(`ST_AsGeoJSON(wkb_geometry) as geom`), 'tags')
      .from(layerTable).where({mhid});

      if(!data || data.length === 0){
        debug.error(`missing data: ${data}`);
        throw new Error(`Data not found for mhid: ${mhid}`);
      }else{
        const bbox = await db.raw(`select 
        '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox 
        from (select ST_Extent(wkb_geometry) as bbox from ${layerTable} where mhid='${mhid}') a`);             

        const feature = {
          type: 'Feature',
          geometry: JSON.parse(data[0].geom),
          properties: data[0].tags
        };

        feature.properties.mhid = mhid;

        return {
          type: "FeatureCollection",
          features: [feature],
          bbox: JSON.parse(bbox.rows[0].bbox)
        };
      }
    }
};
