// @flow
const knex = require('../../connection')
const multer = require('multer')
const ogr2ogr = require('ogr2ogr')
const fs = require('fs')
const Layer = require('../../models/layer')
const Promise = require('bluebird')
const tus = require('tus-node-server')
const EVENTS = require('tus-node-server').EVENTS
const express = require('express')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')
const DataLoadUtils = require('../../services/data-load-utils')
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('routes/layers-upload')
const local = require('../../local')
const apiError = require('../../services/error-response').apiError
const apiDataError = require('../../services/error-response').apiDataError
const notAllowedError = require('../../services/error-response').notAllowedError
const Importers = require('@bit/kriscarle.maphubs-utils.maphubs-utils.importers')
const csrfProtection = require('csurf')({cookie: false})
const isAuthenticated = require('../../services/auth-check')
const layerViews = require('../../services/layer-views')

const metadataStringToObject = (stringValue) => {
  const keyValuePairList = stringValue.split(',')

  const metadata = {}
  keyValuePairList.forEach((keyValuePair) => {
    const [key, base64Value] = keyValuePair.split(' ')
    metadata[key] = Buffer.from(base64Value, 'base64').toString('ascii')
  })

  return metadata
}

const UPLOAD_PATH = `${local.tempFilePath}/uploads`

const getExt = (fileName: string) => {
  if (fileName.endsWith('.zip')) return 'zip'
  if (fileName.endsWith('.pbf')) return 'pbf'
  if (fileName.endsWith('.maphubs')) return 'maphubs'
  if (fileName.endsWith('.csv')) return 'csv'
  if (fileName.endsWith('.kml')) return 'kml'
  if (fileName.endsWith('.kmz')) return 'kmz'
  if (fileName.endsWith('.gpx')) return 'gpx'
  if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) return 'geojson'
  if (fileName.endsWith('.shp')) {
    throw new Error('Shapefile must uploaded in a Zip file')
  } else {
    throw new Error(`Unsupported file type: ${fileName}`)
  }
}

module.exports = function (app: any) {
  const server = new tus.Server()
  server.datastore = new tus.FileStore({
    path: '/' + UPLOAD_PATH
  })

  const uploadApp = express()
  uploadApp.all('*', server.handle.bind(server))

  server.on(EVENTS.EVENT_UPLOAD_COMPLETE, async (event) => {
    console.log(event)
    console.log(`Upload complete for file ${event.file.id}`)
    const metadata = metadataStringToObject(event.file.upload_metadata)
    debug.log(metadata)
  })

  app.use('/api/layer/upload', isAuthenticated, uploadApp)

  app.post('/api/layer/complete/upload', isAuthenticated, async (req, res) => {
    const {layer_id, uploadUrl, originalName} = req.body
    if (layer_id && uploadUrl && originalName) {
      try {
        const layer = await Layer.getLayerByID(layer_id)
        if (layer) {
          const shortid = layer.shortid
          if (layer.created_by_user_id === req.user_id) {
            const importer = Importers.getImporterFromFileName(originalName)
            const uploadUrlParts = uploadUrl.split('/')
            const fileid = uploadUrlParts[uploadUrlParts.length - 1]
            const path = UPLOAD_PATH + '/' + fileid
            const ext = getExt(originalName)
            const pathWithExt = `${path}.${ext}`
            await new Promise((resolve, reject) => {
              // path set by us with a uuid filename, extension value is not copying directly from user input
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              fs.rename(path, pathWithExt, error => {
                if (error) reject(error)
                resolve()
              })
            })
            let importerResult
            try {
              importerResult = await importer(pathWithExt, layer_id)
            } catch (err) {
              log.error(err.message)
              apiError(res, 200)(err)
              return
            }
            if (importerResult.success === false && importerResult.shapefiles) {
              await DataLoadUtils.storeTempShapeUpload(req.file.path, layer_id)
              debug.log('Finished storing temp path')
            } else if (importerResult.type && importerResult.type === 'FeatureCollection') {
              // is geoJSON
              const result = await DataLoadUtils.storeTempGeoJSON(importerResult, path, layer_id, shortid, false, true)
              await knex.transaction(async (trx) => {
                return layerViews.createLayerViews(layer_id, layer.presets, trx)
              })
              log.info('Upload Complete')
              res.status(200).send(result)
            } else {
              // pass through other types of results
              return res.status(200).send(importerResult)
            }
          }
        } else {
          return res.status(400).send('layer not found')
        }
      } catch (err) {
        log.error(err.message)
        apiError(res, 200)(err)
      }
    } else {
      debug.log('missing required data')
      apiDataError(res)
    }
  })

  app.post('/api/layer/create/savedata/:id', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const layer_id = Number.parseInt(req.params.id || '', 10)
      if (await Layer.allowedToModify(layer_id, req.user_id)) {
        await knex.transaction(async (trx) => {
          const layer = await Layer.getLayerByID(layer_id, trx)
          if (layer) {
            await trx('omh.layers').update({status: 'loaded'}).where({layer_id})
            debug.log('data load transaction complete')
            return res.status(200).send({success: true})
          } else {
            return res.status(200).send({success: false, error: 'layer not found'})
          }
        })
      } else {
        notAllowedError(res, 'layer')
      }
    } catch (err) { apiError(res, 500)(err) }
  })

  app.post('/api/layer/:id/upload', isAuthenticated, multer({dest: local.tempFilePath + '/uploads/'}).single('file'),
    async (req, res) => {
      const layer_id = Number.parseInt(req.params.id || '', 10)
      try {
        const layer = await Layer.getLayerByID(layer_id)
        if (layer) {
          const shortid = layer.shortid
          if (layer.created_by_user_id === req.user_id) {
            debug.log('Filename: ' + req.file.originalname)
            debug.log('Mimetype: ' + req.file.mimetype)
            const importer = Importers.getImporterFromFileName(req.file.originalname)
            const importerResult = await importer(req.file.path, layer_id)
            if (importerResult.type && importerResult.type === 'FeatureCollection') {
            // is geoJSON
              const result = await DataLoadUtils.storeTempGeoJSON(importerResult, req.file.path, layer_id, shortid, false, true)
              log.info('Upload Complete')
              res.status(200).send(result)
              log.info('upload response sent')
            } else {
            // pass through other types of results
              return res.status(200).send(importerResult)
            }
          } else {
            return notAllowedError(res, 'layer')
          }
        } else {
          throw new Error('layer not found')
        }
      } catch (err) {
        log.error(err.message)
        // in this case allow error message to be sent to user
        apiError(res, 200, err.message)(err)
      }
    })

  app.post('/api/layer/finishupload', csrfProtection, isAuthenticated, async (req, res) => {
    if (req.body.layer_id && req.body.requestedShapefile) {
      debug.log('finish upload for layer: ' + req.body.layer_id + ' requesting shapefile: ' + req.body.requestedShapefile)
      try {
        const layer = await Layer.getLayerByID(req.body.layer_id)
        const shortid = layer.shortid
        if (layer.created_by_user_id === req.user_id) {
          debug.log('allowed')
          // get file path
          const path = await DataLoadUtils.getTempShapeUpload(req.body.layer_id)
          debug.log('finishing upload with file: ' + path)

          const shpFilePath = path + '_zip' + '/' + req.body.requestedShapefile

          const ogr = ogr2ogr(shpFilePath).format('GeoJSON').skipfailures().options(['-t_srs', 'EPSG:4326']).timeout(60000)
          const geoJSON = await Promise.promisify(ogr.exec, {context: ogr})()

          const result = await DataLoadUtils.storeTempGeoJSON(geoJSON, path, req.body.layer_id, shortid, true, true)
          return res.status(200).send(result)
        } else {
          return notAllowedError(res, 'layer')
        }
      } catch (err) {
        log.error(err.message)
        apiError(res, 200)(err)
      }
    } else {
      debug.log('missing required data')
      apiDataError(res)
    }
  })
}
