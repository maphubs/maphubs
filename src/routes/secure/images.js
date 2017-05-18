//@flow
var Image = require('../../models/image');
var debug = require('../../services/debug')('routes/images');
var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var imageUtils = require('../../services/image-utils');
var log = require('../../services/log');

module.exports = function(app: any) {

  app.get('/image/:id.*', (req, res, next) => {
    var image_id = parseInt(req.params.id || '', 10);
    //var ext = req.params.ext;
    debug('getting image: ' + image_id);
    Image.getImageByID(image_id)
    .then((image) => {
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

  app.get('/group/:id/image', (req, res) => {
    var group_id = req.params.id;
    Image.getGroupImage(group_id)
    .then((result) => {
      if(result && result.image){
        imageUtils.processImage(result.image, req, res);
      }else{
        res.status(404).send();
      }
    }).catch(apiError(res, 404));
  });

  app.get('/group/:id/thumbnail', (req, res) => {
    var group_id = req.params.id;
    Image.getGroupThumbnail(group_id)
    .then((result) => {
      if(result && result.thumbnail){
        imageUtils.processImage(result.thumbnail, req, res);
      }else{
        return res.redirect('https://cdn.maphubs.com/assets/missing_group.png');
      }
    }).catch((err) => {
      log.error(err);
      return res.redirect('https://cdn.maphubs.com/assets/missing_group.png');
    });
  });

  app.get('/hub/:id/images/logo', (req, res) => {
    var hub_id = req.params.id;
    Image.getHubImage(hub_id, 'logo')
    .then((result) => {
      imageUtils.processImage(result.image, req, res);
    }).catch(apiError(res, 404));
  });

  app.get('/hub/:id/images/logo/thumbnail', (req, res) => {
    var hub_id = req.params.id;
    Image.getHubThumbnail(hub_id, 'logo')
    .then((result) => {
      if(result && result.thumbnail){
        imageUtils.processImage(result.thumbnail, req, res);
      }else{
        res.status(404).send();
      }
    }).catch(apiError(res, 404));
  });

  app.get('/hub/:id/images/banner', (req, res) => {
    var hub_id = req.params.id;
    Image.getHubImage(hub_id, 'banner')
    .then((result) => {
      imageUtils.processImage(result.image, req, res);
    }).catch(apiError(res, 404));
  });

  app.get('/hub/:id/images/banner/thumbnail', (req, res) => {
    var hub_id = req.params.id;
    Image.getHubThumbnail(hub_id, 'banner')
    .then((result) => {
      if(result && result.thumbnail){
        imageUtils.processImage(result.thumbnail, req, res);
      }else{
        res.status(404).send();
      }
    }).catch(apiError(res, 404));
  });

  app.get('/images/story/:storyid/image/:imageid.jpg', (req, res) => {
    var story_id = req.params.storyid;
    var image_id = req.params.imageid;
    Image.getStoryImage(story_id, image_id)
    .then((result) => {
      if(result && result.image){
        imageUtils.processImage(result.image, req, res);
      }else{
        res.status(404).send();
      }
    }).catch(apiError(res, 404));
  });

  app.get('/images/story/:storyid/thumbnail/:imageid.jpg', (req, res) => {
    var story_id = req.params.storyid;
    var image_id = req.params.imageid;
    Image.getStoryThumbnail(story_id, image_id)
    .then((result) => {
      if(result && result.thumbnail){
        imageUtils.processImage(result.thumbnail, req, res);
      }else{
        res.status(404).send();
      }
    }).catch(apiError(res, 404));
  });

};
