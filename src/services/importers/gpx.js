// @flow
const Promise = require('bluebird')
const fs = require('fs')
const ogr2ogr = require('ogr2ogr')
const local = require('../../local')
const debug = require('../debug')('services/importers/gpx')

module.exports = async function (filePath: string, layer_id: number) {
  /* eslint-disable security/detect-non-literal-fs-filename */
  // file path is a folder from a env var + a GUID, not orginal filename
  const ogr = ogr2ogr(fs.createReadStream(filePath), 'GPX')
    .format('GeoJSON').skipfailures()
    .options(['-t_srs', 'EPSG:4326', '-sql', 'SELECT * FROM tracks'])
    .timeout(60000)
  const geoJSON = await Promise.promisify(ogr.exec, {context: ogr})()
  if (geoJSON.features && geoJSON.features.length === 0) {
    debug.log('No tracks found, loading waypoints')
    const ogrWaypoints = ogr2ogr(fs.createReadStream(filePath), 'GPX')
      .format('GeoJSON').skipfailures()
      .options(['-t_srs', 'EPSG:4326', '-sql', 'SELECT * FROM waypoints'])
      .timeout(60000)

    const geoJSON = await Promise.promisify(ogrWaypoints.exec)()
    return geoJSON
  } else {
    if (local.writeDebugData) {
      fs.writeFile(local.tempFilePath + '/gpx-upload-layer-' + layer_id + '.geojson', JSON.stringify(geoJSON), (err) => {
        if (err) {
          throw err
        }
      })
    }
    return geoJSON
  }
}
