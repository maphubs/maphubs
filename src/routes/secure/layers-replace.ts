import Layer from '../../models/layer'
import csurf from 'csurf'
import {
  apiError,
  apiDataError,
  notAllowedError
} from '../../services/error-response'
import login from 'connect-ensure-login'
import DataLoadUtils from '../../services/data-load-utils'
import LayerViews from '../../services/layer-views'
import knex from '../../connection'
import multer from 'multer'
import local from '../../local'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import Importers from '@bit/kriscarle.maphubs-utils.maphubs-utils.importers'
import isAuthenticated from '../../services/auth-check'

const debug = DebugService('routes/layers-replace')

const csrfProtection = csurf({
  cookie: false
})

export default function (app: any): void {
  app.post(
    '/api/layer/:id/replace',
    isAuthenticated,
    multer({
      dest: process.env.TEMP_FILE_PATH + '/uploads/'
    }).single('file'),
    async (req, res) => {
      const layer_id = Number.parseInt(req.params.id || '', 10)

      try {
        const layer = await Layer.getLayerByID(layer_id)

        if (layer) {
          const shortid = layer.shortid

          if (layer.created_by_user_id === req.user_id) {
            debug.log('Mimetype: ' + req.file.mimetype)
            const importer = Importers.getImporterFromFileName(
              req.file.originalname
            )
            const importerResult = await importer(req.file.path, layer_id)

            if (importerResult.success === false && importerResult.shapefiles) {
              await DataLoadUtils.storeTempShapeUpload(req.file.path, layer_id)
              debug.log('Finished storing temp path')
            } else if (
              importerResult.type &&
              importerResult.type === 'FeatureCollection'
            ) {
              // is geoJSON
              await knex.transaction(async (trx) => {
                const result = await DataLoadUtils.storeTempGeoJSON(
                  importerResult,
                  req.file.path,
                  layer_id,
                  shortid,
                  true,
                  false,
                  trx
                )
                return res.status(200).send(result)
              })
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
        apiError(res, 200)(err)
      }
    }
  )
  app.post(
    '/api/layer/:id/replace/save',
    csrfProtection,
    isAuthenticated,
    async (req, res) => {
      try {
        const layer_id = Number.parseInt(req.params.id || '', 10)

        if (layer_id) {
          if (await Layer.allowedToModify(layer_id, req.user_id)) {
            await knex.transaction(async (trx) => {
              await DataLoadUtils.removeLayerData(layer_id, trx)
              const layer = await Layer.getLayerByID(layer_id, trx)

              if (layer) {
                await DataLoadUtils.loadTempData(layer_id, trx)
                await LayerViews.replaceViews(layer_id, layer.presets, trx)
                await Layer.setComplete(layer_id, trx)
                return res.send({
                  success: true
                })
              } else {
                return res.send({
                  success: false,
                  error: 'layer not found'
                })
              }
            })
          } else {
            return notAllowedError(res, 'layer')
          }
        } else {
          apiDataError(res)
        }
      } catch (err) {
        apiError(res, 200)(err)
      }
    }
  )
}
