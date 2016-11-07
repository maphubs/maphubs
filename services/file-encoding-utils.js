var fs = require("fs");
var jschardet = require("jschardet");
var iconv = require('iconv-lite');
var debug = require('./debug')('file-encoding-utils');

module.exports = {

  getDecodedFileWithBestGuess(path){
    var content = fs.readFileSync(path);
    var encoding = jschardet.detect(content).encoding.toLowerCase();
    debug('Guessing Encoding: ' + encoding);
    return iconv.decode(content, encoding);
  }

};
