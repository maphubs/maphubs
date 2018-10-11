const fs = require('fs')
const jschardet = require('jschardet')
const iconv = require('iconv-lite')
const debug = require('../debug')('file-encoding-utils')

module.exports = {

  getDecodedFileWithBestGuess (path) {
    const content = fs.readFileSync(path)
    const encoding = jschardet.detect(content).encoding.toLowerCase()
    debug.log('Guessing Encoding: ' + encoding)
    return iconv.decode(content, encoding)
  }

}
