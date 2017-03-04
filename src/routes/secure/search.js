// @flow
var knex = require('../../connection.js');
var Promise = require('bluebird');
var log = require('../../services/log.js');
//var debug = require('../../services/debug')('routes/search');
var turf_bbox = require('@turf/bbox');
var csrfProtection = require('csurf')({cookie: false});
var SearchIndex = require('../../models/search-index');

module.exports = function(app: any) {

  app.get('/search', csrfProtection, function(req, res) {
      res.render('search', {
        title: req.__('Search') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {}, req
      });
  });

  //TODO: rewrite
  app.get('/api/global/search', function(req, res, next) {
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
              results.forEach(result =>{
                 var feature = {
                    type: 'Feature',
                    geometry: JSON.parse(result.geom),
                    properties: result.tags
                  };

                  feature.properties.mhid = result.mhid;
                  featureCollection.features.push(feature);
              });
             
            })
        );
      });

      return Promise.all(commands).then(()=>{
         let bbox = turf_bbox(featureCollection);
         featureCollection.bbox = bbox;
         res.send(featureCollection);
      });
     
    }).catch(function(err) {
        log.error(err);
        next(err);
      });
  });
};
