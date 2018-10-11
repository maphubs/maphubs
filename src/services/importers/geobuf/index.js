// @flow
import geobuf from 'geobuf'
import Pbf from 'pbf'
const Promise = require('bluebird')
const fs = require('fs')
const debug = require('../../debug')('importers/geobuf')

module.exports = async function (filePath: string, layer_id: number, config?: Object) {
  debug.log(`importing Geobuf for layer: ${layer_id}`)
  /* eslint-disable security/detect-non-literal-fs-filename */
  // file path is a folder from a env var + a GUID, not orginal filename
  const file = await Promise.promisify(fs.readFile, {context: fs})(filePath)
  const geoJSON = geobuf.decode(new Pbf(new Uint8Array(file)))
  return geoJSON
}
