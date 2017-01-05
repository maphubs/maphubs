var Layer = require('../../models/layer');
var apiError = require('../../services/error-response').apiError;
var ogr2ogr = require('ogr2ogr');
var tokml = require('tokml');
var debug = require('../../services/debug')('exports');
var privateLayerCheck = require('../../services/private-layer-check').middleware;

module.exports = function(app) {

  app.get('/api/layer/:layer_id/export/json/*', privateLayerCheck, function(req, res) {
      var layer_id = parseInt(req.params.layer_id || '', 10);
      Layer.getGeoJSON(layer_id).then(function(geoJSON){
        res.status(200).send(geoJSON);
      }).catch(apiError(res, 200)); 
  });

  app.get('/api/layer/:layer_id/export/csv/*', privateLayerCheck, function(req, res) {
    var layer_id = parseInt(req.params.layer_id || '', 10);

    Layer.getGeoJSON(layer_id).then(function(geoJSON){
      var resultStr = JSON.stringify(geoJSON);
      var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
      var match = req.get('If-None-Match');
      if(hash == match){
        res.status(304).send();
      }else{
        res.writeHead(200, {
          'Content-Type': 'text/csv',
          'ETag': hash
        });

        ogr2ogr(geoJSON)
        .format('CSV')
        .skipfailures()
        .options(['-t_srs', 'EPSG:4326'])
        .timeout(60000)
        .stream()
        .pipe(res);
      }
    }).catch(apiError(res, 200)); 
  });

  app.get('/api/layer/:layer_id/export/kml/*', privateLayerCheck, function(req, res) {
    var layer_id = parseInt(req.params.layer_id || '', 10);
    Layer.getGeoJSON(layer_id).then(function(geoJSON){
      return Layer.getLayerByID(layer_id)
      .then(function(layer){
        var geoJSONStr = JSON.stringify(geoJSON);
        var hash = require('crypto').createHash('md5').update(geoJSONStr).digest("hex");
        var match = req.get('If-None-Match');
        if(hash == match){
          res.status(304).send();
        }else{
          res.header("Content-Type", "application/vnd.google-earth.kml+xml");
          res.header("ETag", hash);

          geoJSON.features.map(function(feature){
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

          var kml = tokml(geoJSON, {
              name: 'name',
              description: 'description',
              documentName: layer.name,
              documentDescription: layer.description,
              simplestyle: true
          });

          debug("KML Generated");

          res.status(200).send(kml);
        }
      });
    }).catch(apiError(res, 200)); 
  });

  app.get('/api/layer/:layer_id/export/gpx/*', privateLayerCheck, function(req, res) {
    var layer_id = parseInt(req.params.layer_id || '', 10);
    Layer.getGeoJSON(layer_id).then(function(geoJSON){
      var resultStr = JSON.stringify(geoJSON);
      var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
      var match = req.get('If-None-Match');
      if(hash == match){
        res.status(304).send();
      }else{
        res.writeHead(200, {
          'Content-Type': 'application/gpx+xml',
          'ETag': hash
        });
        ogr2ogr(geoJSON)
        .format('GPX')
        .skipfailures()
        .options(['-t_srs', 'EPSG:4326','-dsco', 'GPX_USE_EXTENSIONS=YES'])
        .timeout(60000)
        .stream()
        .pipe(res);
      }
    }).catch(apiError(res, 200)); 
  });

  app.get('/api/layer/:layer_id/export/shp/*', privateLayerCheck, function(req, res) {
    var layer_id = parseInt(req.params.layer_id || '', 10);

    Layer.getGeoJSON(layer_id).then(function(geoJSON){
      var resultStr = JSON.stringify(geoJSON);
      var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
      var match = req.get('If-None-Match');
      if(hash == match){
        res.status(304).send();
      }else{
        res.writeHead(200, {
          'Content-Type': 'application/zip',
          'ETag': hash
        });

      ogr2ogr(geoJSON)
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
