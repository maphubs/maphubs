var fs = require('fs');
var Promise = require('bluebird');
var uuid = require('node-uuid');
var local = require('../local');
var log = require('./log');
var debug = require('./debug')('image-utils');
var easyimg = require('easyimage');

module.exports = {


  decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
},

  resizeBase64(dataString, targetWidth, targetHeight, crop=false){
    var _this = this;
    var cmd = null;

    return new Promise(function(fulfill, reject){
      //decode base64
      var imageBuffer = _this.decodeBase64Image(dataString);
      //save it to a file
      var origFile = uuid.v4() + '.png';
      var resizedFile = uuid.v4() + '.png';
      var convertedFile = uuid.v4() + '.jpg';
      var origfilePath = local.tempFilePath + '/' + origFile;
      var resizedFilePath = local.tempFilePath + '/' + resizedFile;
      var convertedFilePath = local.tempFilePath + '/' + convertedFile;
      fs.writeFile(origfilePath, imageBuffer.data, function(err) {
        if(err){
          log.error(err);
          reject(err);
        }
        if(crop){
          cmd = easyimg.crop({
            src:origfilePath, dst:resizedFilePath,
            cropwidth:targetWidth, cropheight:targetHeight,
            background: 'white'
          });
        }else{
          cmd = easyimg.resize({
            src:origfilePath, dst:resizedFilePath,
            width:targetWidth, height:targetHeight,
            background: 'white'
          });
        }
         cmd.then(
          function(resizedImage) {
             debug('Resized and cropped: ' + resizedImage.width + ' x ' + resizedImage.height);
             easyimg.convert({
               src:resizedFilePath, dst:convertedFilePath, quality: 85
              })
              .then(
              function() {
                var bitmap = fs.readFileSync(convertedFilePath);
                var resizedImageBase64String = 'data:image/jpeg;base64,' + new Buffer(bitmap).toString('base64');
                //debug(resizedImageBase64String);
                fulfill(resizedImageBase64String);
                fs.unlink(origfilePath);
                fs.unlink(resizedFilePath);
                fs.unlink(convertedFilePath);
              });

          },
          function (err) {
            reject(err);
            fs.unlink(origfilePath);
            fs.unlink(resizedFilePath);
            fs.unlink(convertedFilePath);
          }
        );
      });
    });

  }

};
