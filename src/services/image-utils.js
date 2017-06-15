// @flow
var fs = require('fs');
var Promise = require('bluebird');
var uuid = require('uuid').v4;
var local = require('../local');
var log = require('./log');
var debug = require('./debug')('image-utils');
var easyimg = require('easyimage');

module.exports = {

  processImage(image: string, req: any, res: any){
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
    if(hash === match){
      res.status(304).send();
    }else{
      res.writeHead(200, {
        'Content-Type': dataType,
        'Content-Length': img.length,
        'ETag': hash
      });
      res.end(img);
    }
  },

  decodeBase64Image(dataString: string) {
  var matches: Array<string> = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
},

  resizeBase64(dataString: string, targetWidth: number, targetHeight: number, crop: boolean=false){
    var _this = this;
    var cmd = null;

    return new Promise((fulfill, reject) => {
      //decode base64
      var imageBuffer = _this.decodeBase64Image(dataString);
      //save it to a file
      var origFile = uuid() + '.png';
      var resizedFile = uuid() + '.png';
      var convertedFile = uuid() + '.jpg';
      var origfilePath = local.tempFilePath + '/' + origFile;
      var resizedFilePath = local.tempFilePath + '/' + resizedFile;
      var convertedFilePath = local.tempFilePath + '/' + convertedFile;
      fs.writeFile(origfilePath, imageBuffer.data, (err) => {
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
          (resizedImage) => {
             debug('Resized and cropped: ' + resizedImage.width + ' x ' + resizedImage.height);
             easyimg.convert({
               src:resizedFilePath, dst:convertedFilePath, quality: 85
              })
              .then(
              () => {
                var bitmap = fs.readFileSync(convertedFilePath);
                var resizedImageBase64String = 'data:image/jpeg;base64,' + new Buffer(bitmap).toString('base64');
                //debug(resizedImageBase64String);
                fulfill(resizedImageBase64String);
                fs.unlink(origfilePath);
                fs.unlink(resizedFilePath);
                fs.unlink(convertedFilePath);
              });

          },
          (err) => {
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
