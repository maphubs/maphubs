// @flow
const log = require('../../log')
const unzip = require('unzip2')
const Promise = require('bluebird')
const fs = require('fs')
const ogr2ogr = require('ogr2ogr')
const shapefileFairy = require('./shapefile-fairy')
const debug = require('../../debug')('importers/shapefile')
const JSONStream = require('JSONStream')

const streamCloseToPromise = function (stream) {
  return new Promise((resolve, reject) => {
    stream.on('close', resolve)
    stream.on('error', reject)
  })
}

module.exports = async function (filePath: string, layer_id: number, config?: Object) {
  /* eslint-disable security/detect-non-literal-fs-filename */
  // file path is a folder from a env var + a GUID, not orginal filename
  log.info('Starting Shapefile Importer')
  const pipedStream = fs.createReadStream(filePath).pipe(unzip.Extract({path: filePath + '_zip'}))
  await streamCloseToPromise(pipedStream)
  log.info('Zip file extracted')
  // validate
  log.info('Validating Shapefile')
  const result = await shapefileFairy(filePath, {extract: false})
  debug.log('ShapefileFairy Result: ' + JSON.stringify(result))
  if (result && result.code === 'MULTIPLESHP') {
    log.info('Multiple Shapfiles Detected: ' + result.shapefiles.toString())
    // tell the client if we were successful
    return {
      success: false,
      code: result.code,
      shapefiles: result.shapefiles
    }
  } else if (result) {
    debug.log('Shapefile Validation Successful')
    const shpFilePath = filePath + '_zip/' + result.shp
    debug.log('shapefile: ' + shpFilePath)
    const ogr = ogr2ogr(shpFilePath)
      .format('GeoJSON')
      .skipfailures()
      .options(['-t_srs', 'EPSG:4326'])
      .timeout(1200000)
      .stream()

    return new Promise((resolve, reject) => {
      const stream = ogr.pipe(JSONStream.parse('features.*'))
      const features = []

      stream.on('data', (data) => {
        features.push(data)
      })

      stream.on('end', () => {
        debug.log('Shapefile Conversion to GeoJSON Successful')
        log.info(`Converted ${features.length} features to GeoJSON`)
        resolve({
          type: 'FeatureCollection',
          features
        })
      })
      stream.on('error', (err) => {
        throw err
      })
    })
  } else {
    log.error(`Unknown Shapefile Validation Error`)
    return {
      success: false,
      value: result
    }
  }
}
