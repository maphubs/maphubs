// @flow
var Promise = require('bluebird');
var fs: typeof fs = Promise.promisifyAll(require("fs"));
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
    var img = Buffer.from(data, 'base64');
    var hash = require('crypto').createHash('md5').update(img).digest("hex");
    var match = req.get('If-None-Match');
     /*eslint-disable security/detect-possible-timing-attacks */
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
  var matches: any = dataString.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = Buffer.from(matches[2], 'base64');

  return response;
},

  async resizeBase64(dataString: string, targetWidth: number, targetHeight: number, crop: boolean=false){
    var _this = this;
    try{
      //decode base64
      var imageBuffer = _this.decodeBase64Image(dataString);
      //save it to a file
      var origFile = uuid() + '.png';
      var resizedFile = uuid() + '.png';
      var convertedFile = uuid() + '.jpg';
      var origfilePath = local.tempFilePath + '/' + origFile;
      var resizedFilePath = local.tempFilePath + '/' + resizedFile;
      var convertedFilePath = local.tempFilePath + '/' + convertedFile;
  
      await fs.writeFileAsync(origfilePath, imageBuffer.data);
      const options = {
        src:origfilePath, 
        dst:resizedFilePath,
        background: 'white',
        cropwidth: undefined,
        cropheight: undefined,
        width: targetWidth, 
        height: targetHeight
      };
      let resizedImage;
      if(crop){
        options.cropwidth = targetWidth;
        options.cropheight = targetHeight;
        debug.log('cropping');
        resizedImage = await easyimg.crop(options);
      }else{
        debug.log('resizing');
        resizedImage = await easyimg.resize(options);
      }
      debug.log('Resized and cropped: ' + resizedImage.width + ' x ' + resizedImage.height);
      await easyimg.convert({
        src:resizedFilePath, dst:convertedFilePath, quality: 85
      });

      //using configured temp path and uuid's, no user input used in path
      //eslint-disable-next-line security/detect-non-literal-fs-filename
      var bitmap = fs.readFileSync(convertedFilePath);
      var resizedImageBase64String = 'data:image/jpeg;base64,' + Buffer.from(bitmap).toString('base64');
      
      /* eslint-disable security/detect-non-literal-fs-filename */
      await fs.unlinkAsync(origfilePath);
      await fs.unlinkAsync(resizedFilePath);
      await fs.unlinkAsync(convertedFilePath);
      return resizedImageBase64String;

    }catch(err) {
      try {
        log.error(err);
        await fs.unlinkAsync(origfilePath);
        await fs.unlinkAsync(resizedFilePath);
        await fs.unlinkAsync(convertedFilePath);
      }catch(err){
        log.error(err);
      }
    }
  }

};
