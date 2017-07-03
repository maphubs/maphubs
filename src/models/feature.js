// @flow
var knex = require('../connection.js');

module.exports = {

  getFeatureByID(mhid: string, layer_id: number, trx: any) {
    var _this = this;
    return _this.getGeoJSON(mhid, layer_id, trx)
      .then((geojson) => {
        var feature = {geojson};
        return _this.getFeatureNotes(mhid, layer_id, trx)
        .then((notes) => {
          var result = {feature, notes};
          return result;
        });
    });
  },

  getFeatureNotes(mhid: string, layer_id: number, trx: any){
    let db = knex; if(trx){db = trx;}
    return db('omh.feature_notes').select('notes')
    .where({mhid, layer_id})
    .then((result) => {
      if(result && result.length === 1){
        return result[0];
      }
      return null;
    });
  },

  saveFeatureNote(mhid: string, layer_id: number, user_id: number, notes: string, trx: any){
    let db = knex; if(trx){db = trx;}
    return db('omh.feature_notes').select('mhid').where({mhid, layer_id})
    .then((result) => {
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
    });
  },

  /**
   * Get GeoJSON for feature(s)
   * 
   * @param {string} mhid 
   * @param {number} layer_id 
   * @returns 
   */
    getGeoJSON(mhid: string, layer_id: number, trx: any) {
      let db = knex; if(trx){db = trx;}
     
      var layerTable = 'layers.data_' + layer_id;  
      return db.select(db.raw(`ST_AsGeoJSON(wkb_geometry) as geom`), 'tags')
      .from(layerTable).whereIn('mhid', [mhid])
          .then((data) => {
            if(!data || data.length === 0){
              throw new Error(`Data not found for mhid: ${mhid}`);
            }else{
              return  db.raw(`select 
              '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox 
              from (select ST_Extent(wkb_geometry) as bbox from ${layerTable} where mhid='${mhid}') a`)             
              .then((bbox) => {
                var feature = {
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
              });
            }
      });
    }

};
