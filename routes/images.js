/* @flow weak */
var Image = require('../models/image');
var debug = require('../services/debug')('routes/images');
var apiError = require('../services/error-response').apiError;
var nextError = require('../services/error-response').nextError;

module.exports = function(app) {

  var processImage = function(image, req, res){
    var dataArr = image.image.split(',');
    var dataInfoArr = dataArr[0].split(':')[1].split(';');
    var dataType = dataInfoArr[0];
    var data = dataArr[1];
    var img = new Buffer(data, 'base64');
    var hash = require('crypto').createHash('md5').update(img).digest("hex");
    var match = req.get('If-None-Match');
    if(hash == match){
      res.status(304).send();
    }else{
      res.writeHead(200, {
        'Content-Type': dataType,
        'Content-Length': img.length,
        'ETag': hash
      });
      res.end(img);
    }
  };

  app.get('/image/:id.*', function(req, res, next) {
    var image_id = parseInt(req.params.id || '', 10);
    //var ext = req.params.ext;
    debug('getting image: ' + image_id);
    Image.getImageByID(image_id)
    .then(function(image){
      var dataArr = image.image.split(',');
      var dataInfoArr = dataArr[0].split(':')[1].split(';');
      var dataType = dataInfoArr[0];
      var data = dataArr[1];
      var img = new Buffer(data, 'base64');
      res.writeHead(200, {
        'Content-Type': dataType,
        'Content-Length': img.length,
        'ETag': require('crypto').createHash('md5').update(img).digest("hex")
      });
      res.end(img);
    }).catch(nextError(next));
  });

  app.get('/group/:id/image', function(req, res) {
    var group_id = req.params.id;
    Image.getGroupImage(group_id)
    .then(function(image){
      processImage(image, req, res);
    }).catch(apiError(res, 404));
  });

  app.get('/hub/:id/images/logo', function(req, res) {
    var hub_id = req.params.id;
    Image.getHubImage(hub_id, 'logo')
    .then(function(image){
      processImage(image, req, res);
    }).catch(apiError(res, 404));
  });

  app.get('/hub/:id/images/banner', function(req, res) {
    var hub_id = req.params.id;
    Image.getHubImage(hub_id, 'banner')
    .then(function(image){
      processImage(image, req, res);
    }).catch(apiError(res, 404));
  });

};
