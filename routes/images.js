/* @flow weak */
var Image = require('../models/image');
var Story = require('../models/story');
var debug = require('../services/debug')('routes/images');
var apiError = require('../services/error-response').apiError;
var nextError = require('../services/error-response').nextError;

module.exports = function(app) {

  var processImage = function(image, req, res){
    if(!image){
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': 0
      });
      res.end('');
      return;
    }
    var dataArr = image.split(',');
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
      var dataArr = image.split(',');
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
    .then(function(result){
      if(result && result.image){
        processImage(result.image, req, res);
      }else{
        res.status(404).send();
      }
    }).catch(apiError(res, 404));
  });

  app.get('/group/:id/thumbnail', function(req, res) {
    var group_id = req.params.id;
    Image.getGroupThumbnail(group_id)
    .then(function(result){
      if(result && result.thumbnail){
        processImage(result.thumbnail, req, res);
      }else{
        res.status(404).send();
      }
    }).catch(apiError(res, 404));
  });

  app.get('/hub/:id/images/logo', function(req, res) {
    var hub_id = req.params.id;
    Image.getHubImage(hub_id, 'logo')
    .then(function(result){
      processImage(result.image, req, res);
    }).catch(apiError(res, 404));
  });

  app.get('/hub/:id/images/banner', function(req, res) {
    var hub_id = req.params.id;
    Image.getHubImage(hub_id, 'banner')
    .then(function(result){
      processImage(result.image, req, res);
    }).catch(apiError(res, 404));
  });

  app.get('/images/story/:id/firstimage', function(req, res) {
    var story_id = req.params.id;
    Story.getFirstImage(story_id)
    .then(function(result){
      processImage(result.firstimage, req, res);
    }).catch(apiError(res, 404));
  });

};
