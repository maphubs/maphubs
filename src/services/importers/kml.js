// @flow
const Promise = require('bluebird')
const fs = require('fs')
const ogr2ogr = require('ogr2ogr')
const debug = require('../debug')('services/importers/kml')

module.exports = async function (filePath: string, layer_id: number) {
  debug.log(`importing KML for layer: ${layer_id}`)
  /* eslint-disable security/detect-non-literal-fs-filename */
  // file path is a folder from a env var + a GUID, not orginal filename
  const ogr = ogr2ogr(fs.createReadStream(filePath), 'KML')
    .format('GeoJSON').skipfailures()
    .options(['-t_srs', 'EPSG:4326']).timeout(60000)

  const geoJSON = await Promise.promisify(ogr.exec, {context: ogr})()
  return geoJSON
}
