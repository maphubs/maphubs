var Layer = require('../models/layer');
var apiError = require('../services/error-response').apiError;
var GeoXForm = require('geo-xform');
var Readable = require('stream').Readable;
var local = require('../local');

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
          var rs = new Readable;
          rs.push(resultStr);
          rs.push(null);
          rs.pipe(GeoXForm.createStream('csv', {path: local.tempFilePath})).pipe(res);
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
          var rs = new Readable;
          rs.push(resultStr);
          rs.push(null);
          rs.pipe(GeoXForm.createStream('kml', {path: local.tempFilePath})).pipe(res);
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
          var rs = new Readable;
          rs.push(resultStr);
          rs.push(null);
          rs.pipe(GeoXForm.createStream('zip', {path: local.tempFilePath})).pipe(res);
        }
        //res.send(result);
      }).catch(apiError(res, 500));

  });

};
