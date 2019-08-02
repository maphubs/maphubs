// @flow
import Locales from '../../services/locales'
const Layer = require('../../models/layer')
const csrfProtection = require('csurf')({cookie: false})
const nextError = require('../../services/error-response').nextError
const login = require('connect-ensure-login')
const apiError = require('../../services/error-response').apiError
const apiDataError = require('../../services/error-response').apiDataError
const notAllowedError = require('../../services/error-response').notAllowedError
const DataLoadUtils = require('../../services/data-load-utils')
const LayerViews = require('../../services/layer-views')
const knex = require('../../connection')
const multer = require('multer')
const local = require('../../local')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('routes/layers-replace')
const Importers = require('@bit/kriscarle.maphubs-utils.maphubs-utils.importers')
const isAuthenticated = require('../../services/auth-check')
const pageOptions = require('../../services/page-options-helper')

module.exports = function (app: any) {
  app.get('/layer/replace/:id/*', csrfProtection, login.ensureLoggedIn(), async (req, res, next) => {
    const user_id = req.session.user.maphubsUser.id
    const layer_id = parseInt(req.params.id || '', 10)

    // confirm that this user is allowed to administer this layeradmin
    try {
      const allowed = await Layer.allowedToModify(layer_id, user_id)
      if (allowed) {
        const layer = await Layer.getLayerByID(layer_id)
        if (layer) {
          app.next.render(req, res, '/layerreplace', await pageOptions(req, {
            title: Locales.getLocaleStringObject(req.locale, layer.name) + ' - ' + local.productName,
            props: {layer}
          }))
        } else {
          nextError(next)(new Error('Layer not found'))
        }
      } else {
        return res.redirect('/unauthorized')
      }
    } catch (err) {
      nextError(next)(err)
    }
  })

  app.post('/api/layer/:id/replace', isAuthenticated, multer({dest: local.tempFilePath + '/uploads/'}).single('file'),
    async (req, res) => {
      const layer_id = parseInt(req.params.id || '', 10)
      try {
        const layer = await Layer.getLayerByID(layer_id)
        if (layer) {
          const shortid = layer.shortid
          if (layer.created_by_user_id === req.user_id) {
            debug.log('Mimetype: ' + req.file.mimetype)
            const importer = Importers.getImporterFromFileName(req.file.originalname)
            const importerResult = await importer(req.file.path, layer_id)
            if (importerResult.success === false && importerResult.shapefiles) {
              await DataLoadUtils.storeTempShapeUpload(req.file.path, layer_id)
              debug.log('Finished storing temp path')
            } else if (importerResult.type && importerResult.type === 'FeatureCollection') {
              // is geoJSON
              await knex.transaction(async (trx) => {
                const result = await DataLoadUtils.storeTempGeoJSON(importerResult, req.file.path, layer_id, shortid, true, false, trx)
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
    })

  app.post('/api/layer/:id/replace/save', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const layer_id = parseInt(req.params.id || '', 10)
      if (layer_id) {
        if (await Layer.allowedToModify(layer_id, req.user_id)) {
          await knex.transaction(async (trx) => {
            await DataLoadUtils.removeLayerData(layer_id, trx)
            const layer = await Layer.getLayerByID(layer_id, trx)
            if (layer) {
              await DataLoadUtils.loadTempData(layer_id, trx)
              await LayerViews.replaceViews(layer_id, layer.presets, trx)
              await Layer.setComplete(layer_id, trx)
              return res.send({success: true})
            } else {
              return res.send({success: false, error: 'layer not found'})
            }
          })
        } else {
          return notAllowedError(res, 'layer')
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 200)(err) }
  })
}
