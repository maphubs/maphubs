// @flow
const csv2geojson = require('csv2geojson')
const fileEncodingUtils = require('../../file-encoding-utils')
const Promise = require('bluebird')

module.exports = async function (filePath: string, layer_id: number, config?: Object) {
  const data = fileEncodingUtils.getDecodedFileWithBestGuess(filePath)
  const geoJSON = await Promise.promisify(csv2geojson.csv2geojson, {context: csv2geojson})(data)
  if (geoJSON) {
    return geoJSON
  } else {
    throw new Error('Failed to parse CSV for layer: ' + layer_id)
  }
}
