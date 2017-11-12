// @flow
var knex = require('../../connection.js');
var Promise = require('bluebird');
var log = require('../../services/log.js');
//var debug = require('../../services/debug')('routes/search');
import turf_bbox from '@turf/bbox';
var csrfProtection = require('csurf')({cookie: false});
var SearchIndex = require('../../models/search-index');

module.exports = function(app: any) {

  app.get('/search', csrfProtection, (req, res) => {
    return res.render('search', {
      title: req.__('Search') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {}, req
    });
  });

  app.get('/api/global/search', (req, res) => {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
    }
    var q = req.query.q.toLowerCase();

    var featureCollection = {
      type: "FeatureCollection",
      features: [],
      bbox: null
    };

    SearchIndex.queryFeatures(q)
    .then(hits =>{
      //compile mhids by layer
      var layers = {};
      hits.forEach(hit => {
        var layer_id = hit._source.layer_id;
        if(!layers[layer_id]){
          layers[layer_id] = [];
        } 
        layers[layer_id].push(hit._source.mhid);
      });
      //query features for each layer
      var commands = [];
      Object.keys(layers).forEach(layer_id =>{
        commands.push(
           knex.select(knex.raw(`ST_AsGeoJSON(wkb_geometry) as geom`), 'tags', 'mhid')
            .from('layers.data_' + layer_id).whereIn('mhid', layers[layer_id])
            .then(results =>{
              return results.forEach(result =>{
                 var feature = {
                    type: 'Feature',
                    geometry: JSON.parse(result.geom),
                    properties: result.tags
                  };

                  feature.properties.mhid = result.mhid;
                  feature.properties.layer_id = layer_id;
                  featureCollection.features.push(feature);
              });
             
            })
        );
      });

      return Promise.all(commands).then(()=>{
         let bbox = turf_bbox(featureCollection);
         featureCollection.bbox = bbox;
         return res.send(featureCollection);
      });
     
    }).catch((err) => {
        log.error(err);
        throw err;
      });
  });
};
