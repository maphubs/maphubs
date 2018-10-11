// @flow
const fileEncodingUtils = require('../../file-encoding-utils')
const debug = require('../../debug')('importers/geojson')

module.exports = async function (filePath: string, layer_id: number, config?: Object) {
  debug.log(`importing GeoJSON for layer: ${layer_id}`)
  const data = fileEncodingUtils.getDecodedFileWithBestGuess(filePath)
  const geoJSON = JSON.parse(data)
  return geoJSON
}
