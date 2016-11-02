var Layer = require('../models/layer');
var apiError = require('../services/error-response').apiError;
var ogr2ogr = require('ogr2ogr');


module.exports = function(app) {

  app.get('/api/layer/:id/export/json/*', function(req, res) {
      var layer_id = parseInt(req.params.id || '', 10);
      Layer.getGeoJSON(layer_id)
      .then(function(result){
        res.send(result);
      }).catch(apiError(res, 500));
  });


  app.get('/api/layer/:id/export/csv/*', function(req, res) {
      var layer_id = parseInt(req.params.id || '', 10);
      Layer.getGeoJSON(layer_id)
      .then(function(result){
        var resultStr = JSON.stringify(result);
        var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
        var match = req.get('If-None-Match');
        if(hash == match){
          res.status(304).send();
        }else{
          res.writeHead(200, {
            'Content-Type': 'text/csv',
            'ETag': hash
          });

          ogr2ogr(result)
          .format('CSV')
          .skipfailures()
          .options(['-t_srs', 'EPSG:4326'])
          .timeout(60000)
          .stream()
          .pipe(res);

        }
        //res.send(result);
      }).catch(apiError(res, 500));

  });

  app.get('/api/layer/:id/export/kml/*', function(req, res) {
      var layer_id = parseInt(req.params.id || '', 10);
      Layer.getGeoJSON(layer_id)
      .then(function(result){
        var resultStr = JSON.stringify(result);
        var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
        var match = req.get('If-None-Match');
        if(hash == match){
          res.status(304).send();
        }else{
          res.writeHead(200, {
            'Content-Type': 'application/vnd.google-earth.kml+xml',
            'ETag': hash
          });
          ogr2ogr(result)
          .format('KML')
          .skipfailures()
          .options(['-t_srs', 'EPSG:4326'])
          .timeout(60000)
          .stream()
          .pipe(res);
        }
        //res.send(result);
      }).catch(apiError(res, 500));

  });

  app.get('/api/layer/:id/export/gpx/*', function(req, res) {
      var layer_id = parseInt(req.params.id || '', 10);
      Layer.getGeoJSON(layer_id)
      .then(function(result){
        var resultStr = JSON.stringify(result);
        var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
        var match = req.get('If-None-Match');
        if(hash == match){
          res.status(304).send();
        }else{
          res.writeHead(200, {
            'Content-Type': 'application/gpx+xml',
            'ETag': hash
          });
          ogr2ogr(result)
          .format('GPX')
          .skipfailures()
          .options(['-t_srs', 'EPSG:4326'])
          .timeout(60000)
          .stream()
          .pipe(res);
        }
        //res.send(result);
      }).catch(apiError(res, 500));

  });

  app.get('/api/layer/:id/export/shp/*', function(req, res) {
      var layer_id = parseInt(req.params.id || '', 10);
      Layer.getGeoJSON(layer_id)
      .then(function(result){
        var resultStr = JSON.stringify(result);
        var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
        var match = req.get('If-None-Match');
        if(hash == match){
          res.status(304).send();
        }else{
          res.writeHead(200, {
            'Content-Type': 'application/zip',
            'ETag': hash
          });

      ogr2ogr(result)
      .format('ESRI Shapefile')
      .skipfailures()
      .options(['-t_srs', 'EPSG:4326'])
      .timeout(60000)
      .stream()
      .pipe(res);


        }
        //res.send(result);
      }).catch(apiError(res, 500));

  });

};
