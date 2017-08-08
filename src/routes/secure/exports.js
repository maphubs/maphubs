//@flow
var Layer = require('../../models/layer');
var Feature = require('../../models/feature');
var apiError = require('../../services/error-response').apiError;
var ogr2ogr = require('ogr2ogr');
var tokml = require('tokml');
var debug = require('../../services/debug')('exports');
var privateLayerCheck = require('../../services/private-layer-check').middleware;
var knex = require('../../connection.js');
var Promise = require('bluebird');
var Locales = require('../../services/locales');
var MapStyles = require('../../components/Map/Styles');
var geojson2dsv = require('geojson2dsv');
var exportUtils = require('../../services/export-utils');

module.exports = function(app: any) {

  app.get('/api/layer/:layer_id/export/json/*', privateLayerCheck, (req, res) => {
      var layer_id = parseInt(req.params.layer_id || '', 10);
      Layer.getGeoJSON(layer_id).then((geoJSON) => {
        return res.status(200).send(geoJSON);
      }).catch(apiError(res, 200));
  });


  app.get('/api/layer/:layer_id/export/svg/*', privateLayerCheck, (req, res) => {
      var layer_id = parseInt(req.params.layer_id || '', 10);    
      Layer.getLayerByID(layer_id).then((layer) => {
        let table = `layers.data_${layer.layer_id}`;
        return Promise.all([
          knex.raw(`select ST_AsSVG(ST_Transform(wkb_geometry, 900913)) as svg from :table:;`, {table}),
          knex.raw(`select ST_XMin(bbox)::float as xmin, 
            ST_YMin(bbox)::float as ymin, 
            ST_XMax(bbox)::float as xmax, ST_YMax(bbox)::float as ymax 
            from (select ST_Extent(ST_Transform(wkb_geometry, 900913)) as bbox from :table:) a`, {table})
        ]).then((results) => {
          var featureSVGs = results[0];
          var bounds = results[1].rows[0];
          var paths = '';
          
          let savedColor = MapStyles.settings.get(layer.style, 'color');
          let color = savedColor ? savedColor : '#FF0000';
          
          if(layer.data_type === 'point'){
            featureSVGs.rows.forEach((row) => {
               paths += `<path d="${row.svg}"></path>`;
            });

          }else if(layer.data_type === 'line'){
            featureSVGs.rows.forEach((row) => {
               paths += `<path d="${row.svg}"></path>`;
            });
          }else if(layer.data_type === 'polygon'){
            featureSVGs.rows.forEach((row) => {
               paths += `<path fill="${color}" stroke="black" stroke-width="3000" d="${row.svg}"></path>`;
            });

           
          }

          var width = bounds.xmax-bounds.xmin;
          var height = bounds.ymax-bounds.ymin;

          var svg = `
          <svg xmlns="http://www.w3.org/2000/svg"
          id="maphubs-layer-${layer.layer_id}" viewBox="${bounds.xmin} ${bounds.ymin} ${width} ${height*2}" preserveAspectRatio="xMidYMid meet">
          ${paths}
          </svg>
          `;

          res.header("Content-Type", "image/svg+xml");
          return res.status(200).send(svg);
        });
      }).catch(apiError(res, 200));
  });

  app.get('/api/layer/:layer_id/export/csv/*', privateLayerCheck, (req, res) => {
    var layer_id = parseInt(req.params.layer_id || '', 10);

    Layer.getGeoJSON(layer_id).then((geoJSON) => {
      var resultStr = JSON.stringify(geoJSON);
      var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
      var match = req.get('If-None-Match');
      /*eslint-disable security/detect-possible-timing-attacks */
      //We freely give out the Etag hash, don't need to protect against someone brute forcing it
      if(hash === match){
        return res.status(304).send();
      }else{ 
        res.header("Content-Type", "text/csv");
        res.header("ETag", hash);

        let csvString = geojson2dsv(geoJSON, ",", true);

        return res.status(200).send(csvString);

      }
    }).catch(apiError(res, 200));
  });

  app.get('/api/layer/:layer_id/export/geobuf/*', privateLayerCheck, (req, res) => {
    var layer_id = parseInt(req.params.layer_id || '', 10);
    exportUtils.completeGeoBufExport(req, res, layer_id);
  });

  app.get('/api/layer/:layer_id/export/kml/*', privateLayerCheck, (req, res) => {
    var layer_id = parseInt(req.params.layer_id || '', 10);
    Layer.getGeoJSON(layer_id).then((geoJSON) => {
      return Layer.getLayerByID(layer_id)
      .then((layer) => {
        var geoJSONStr = JSON.stringify(geoJSON);
        var hash = require('crypto').createHash('md5').update(geoJSONStr).digest("hex");
        var match = req.get('If-None-Match');
        if(hash === match){
          return res.status(304).send();
        }else{
          res.header("Content-Type", "application/vnd.google-earth.kml+xml");
          res.header("ETag", hash);

          geoJSON.features.map((feature) => {
            if(feature.properties){
              if(layer.data_type === 'polygon'){
                feature.properties['stroke'] = '#212121';
                feature.properties['stroke-width'] = 2;
                feature.properties['fill'] = '#FF0000';
                feature.properties['fill-opacity'] = 0.5;
              }else if(layer.data_type === 'line'){
                feature.properties['stroke'] = '#FF0000';
                feature.properties['stroke-width'] = 2;
              }else if(layer.data_type === 'point'){
                feature.properties['marker-color'] = '#FF0000';
                feature.properties['marker-size'] = 'medium';
              }
            }
          });

          let name = Locales.getLocaleStringObject(req.locale, layer.name);
          let description = Locales.getLocaleStringObject(req.locale, layer.description);
          var kml = tokml(geoJSON, {
              name: 'name',
              description: 'description',
              documentName: name,
              documentDescription: description,
              simplestyle: true
          });

          debug.log("KML Generated");

          return res.status(200).send(kml);
        }
      });
    }).catch(apiError(res, 200));
  });

  app.get('/api/feature/:layer_id/:id/export/kml/*', privateLayerCheck, (req, res, next) => {
    var layer_id = parseInt(req.params.layer_id || '', 10);
     var id = req.params.id;


     var mhid = `${layer_id}:${id}`;

    if(mhid && layer_id){
        Layer.getLayerByID(layer_id)
        .then(layer => {
          return Feature.getFeatureByID(mhid, layer.layer_id)
          .then(result =>{
            var feature = result.feature;
            var geoJSON = feature.geojson;
            var geoJSONStr = JSON.stringify(geoJSON);
        var hash = require('crypto').createHash('md5').update(geoJSONStr).digest("hex");
        var match = req.get('If-None-Match');
        if(hash === match){
          return res.status(304).send();
        }else{
          res.header("Content-Type", "application/vnd.google-earth.kml+xml");
          res.header("ETag", hash);

          geoJSON.features.map((feature) => {
            if(feature.properties){
              if(layer.data_type === 'polygon'){
                feature.properties['stroke'] = '#212121';
                feature.properties['stroke-width'] = 2;
                feature.properties['fill'] = '#FF0000';
                feature.properties['fill-opacity'] = 0.5;
              }else if(layer.data_type === 'line'){
                feature.properties['stroke'] = '#FF0000';
                feature.properties['stroke-width'] = 2;
              }else if(layer.data_type === 'point'){
                feature.properties['marker-color'] = '#FF0000';
                feature.properties['marker-size'] = 'medium';
              }
            }
          });

          let name = Locales.getLocaleStringObject(req.locale, layer.name);
          let description = Locales.getLocaleStringObject(req.locale, layer.description);         
          var kml = tokml(geoJSON, {
              name: 'name',
              description: 'description',
              documentName: name,
              documentDescription: description,
              simplestyle: true
          });

          debug.log("KML Generated");

          return res.status(200).send(kml);
        }
          });
        }).catch(apiError(res, 200));

    }else{
      next(new Error('Missing Required Data'));
    }
          
  });

  app.get('/api/layer/:layer_id/export/gpx/*', privateLayerCheck, (req, res) => {
    var layer_id = parseInt(req.params.layer_id || '', 10);
    Layer.getGeoJSON(layer_id).then((geoJSON) => {
      var resultStr = JSON.stringify(geoJSON);
      var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
      var match = req.get('If-None-Match');
      if(hash === match){
        return res.status(304).send();
      }else{
        res.writeHead(200, {
          'Content-Type': 'application/gpx+xml',
          'ETag': hash
        });
        return ogr2ogr(geoJSON)
        .format('GPX')
        .skipfailures()
        .options(['-t_srs', 'EPSG:4326','-dsco', 'GPX_USE_EXTENSIONS=YES'])
        .timeout(60000)
        .stream()
        .pipe(res);
      }
    }).catch(apiError(res, 200));
  });

  app.get('/api/layer/:layer_id/export/shp/*', privateLayerCheck, (req, res) => {
    var layer_id = parseInt(req.params.layer_id || '', 10);

    Layer.getGeoJSON(layer_id).then((geoJSON) => {
      var resultStr = JSON.stringify(geoJSON);
      var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
      var match = req.get('If-None-Match');
      if(hash === match){
        return res.status(304).send();
      }else{
        res.writeHead(200, {
          'Content-Type': 'application/zip',
          'ETag': hash
        });

      return ogr2ogr(geoJSON)
      .format('ESRI Shapefile')
      .skipfailures()
      .options(['-t_srs', 'EPSG:4326'])
      .timeout(60000)
      .stream()
      .pipe(res);
    }
    }).catch(apiError(res, 200));
  });
};
