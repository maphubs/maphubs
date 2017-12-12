// @flow
const knex = require('../../connection.js');
const Layer = require('../../models/layer');
const apiError = require('../../services/error-response').apiError;
const apiDataError = require('../../services/error-response').apiDataError;
const turfArea = require('@turf/area');
const debug = require('../../services/debug')('layer-metrics');

module.exports = function(app: any) {
  app.post('/metricapi/', async (req, res) => {
    try{
      const data = req.body;
      if(data && data.layer_id && data.geometry){
        const layer_id = parseInt(data.layer_id, 10);
        const layer = await Layer.getLayerByID(layer_id);
        if(!layer){
          return res.status(404).send();
        }
        if(typeof data.geometry !== 'object'){
          return apiDataError(res);
        }
        const layerTable = 'layers.data_' + layer.layer_id; 
        const geoJSONString = JSON.stringify(data.geometry);
        const query = `        
        SELECT 
          ST_AsGeoJSON(
            ST_Intersection(ST_MakeValid(${layerTable}.wkb_geometry), 
              ST_SetSRID(ST_GeomFromGeoJSON('${geoJSONString}'), 4326))
          ) As clipped_geom,
          tags as properties
        FROM ${layerTable}
        WHERE ST_Intersects(ST_MakeValid(${layerTable}.wkb_geometry), 
                ST_SetSRID(ST_GeomFromGeoJSON('${geoJSONString}'), 4326)) 
        ;
        `;
        //debug.log(query);
        const results = await knex.raw(query);
        //debug.log(results);
        if(results && results.rows && results.rows.length > 0){
          debug.log(`Found ${results.rows.length} results`);
          const features = results.rows.map((result) => {
            return {
              type: 'Feature',
              properties: result.properties,
              geometry: JSON.parse(result.clipped_geom)
            };
          });

          //debug.log(features);
          const areaM2 = turfArea({
            type: 'FeatureCollection',
            features
          });

          const area = areaM2 / 10000;

          res.status(200).send({
            count: features.count,
            area,
            unit: 'ha',
            features
          });
          
        }else{
          debug.log('no results found');
          res.status(200).send({
            count: 0,
            area: 0,
            unit: 'ha',
            features: []
          });
        }
      }else{
        apiDataError(res);
      }
    }catch(err){apiError(res, 500)(err);}
  });
};
