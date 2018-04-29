// @flow
const knex = require('../../connection.js')
const Layer = require('../../models/layer')
const LayerData = require('../../models/layer-data')
const Group = require('../../models/group')
// var log = require('../../services/log');
const DataLoadUtils = require('../../services/data-load-utils')
const debug = require('../../services/debug')('routes/layers')
const layerViews = require('../../services/layer-views')
const urlUtil = require('../../services/url-util')

const PhotoAttachment = require('../../models/photo-attachment')
// var Tag = require('../../models/tag');
const apiError = require('../../services/error-response').apiError
const apiDataError = require('../../services/error-response').apiDataError
const notAllowedError = require('../../services/error-response').notAllowedError
const csrfProtection = require('csurf')({cookie: false})
const isAuthenticated = require('../../services/auth-check')

module.exports = function (app: any) {
  app.post('/api/layer/create/savedata/:id', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const layer_id = parseInt(req.params.id || '', 10)
      if (await Layer.allowedToModify(layer_id, req.user_id)) {
        await knex.transaction(async (trx) => {
          const layer = await Layer.getLayerByID(layer_id, trx)
          if (layer) {
            await DataLoadUtils.loadTempData(layer_id, trx, layer.disable_feature_indexing)
            await layerViews.createLayerViews(layer_id, layer.presets, trx)
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

  app.post('/api/layer/create/empty/:id', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const layer_id = parseInt(req.params.id || '', 10)
      if (await Layer.allowedToModify(layer_id, req.user_id)) {
        await knex.transaction(async (trx) => {
          const layer = await Layer.getLayerByID(layer_id, trx)
          if (layer) {
            await DataLoadUtils.createEmptyDataTable(layer.layer_id, trx)
            await layerViews.createLayerViews(layer_id, layer.presets, trx)
            debug.log('init empty transaction complete')
            return res.status(200).send({success: true})
          } else {
            return res.status(200).send({success: false, error: 'layer not found'})
          }
        })
      } else {
        return notAllowedError(res, 'layer')
      }
    } catch (err) { apiError(res, 500)(err) }
  })

  app.post('/api/layer/admin/:action', csrfProtection, isAuthenticated, async (req, res) => {
    const action = req.params.action
    const data = req.body
    if (data) {
      let actionData = []
      switch (action) {
        case 'createLayer':
          actionData = [req.user_id]
          break
        case 'saveSettings':
          if (!data.layer_id) {
            apiDataError(res)
            return
          }
          actionData = [
            data.layer_id,
            data.name,
            data.description,
            data.group_id,
            data.private,
            data.source,
            data.license,
            data.disable_feature_indexing,
            req.user_id
          ]
          break
        case 'saveAdminSettings':
          if (!data.layer_id) {
            apiDataError(res)
            return
          }
          actionData = [
            data.layer_id,
            data.group_id,
            data.disable_export,
            data.allow_public_submit,
            req.user_id
          ]
          break
        case 'saveExternalLayerConfig':
          if (!data.layer_id) {
            apiDataError(res)
            return
          }
          actionData = [
            data.layer_id,
            data.external_layer_config,
            req.user_id
          ]
          break
        case 'saveDataSettings':
          if (!data.layer_id) {
            apiDataError(res)
            return
          }
          actionData = [
            data.layer_id,
            data.is_empty,
            data.empty_data_type,
            data.is_external,
            data.external_layer_type,
            data.external_layer_config,
            req.user_id
          ]
          break
        case 'saveStyle':
          if (!data.layer_id || !data.style) {
            apiDataError(res)
            return
          }
          actionData = [
            data.layer_id,
            data.style,
            data.labels,
            data.legend_html,
            data.settings,
            data.preview_position,
            req.user_id
          ]
          break
        case 'delete':
          if (!data.layer_id) {
            apiDataError(res)
            return
          }
          actionData = [
            data.layer_id,
            data.app = app
          ]
          break
        case 'setComplete':
          if (!data.layer_id) {
            apiDataError(res)
            return
          }
          actionData = [
            data.layer_id
          ]
          break
        default:
          res.status(400).send({success: false, error: 'Bad Request: not a valid option'})
          return
      }

      try {
        if (action === 'createLayer') {
          // confirm user is allowed to add a layer to this group
          if (await Group.allowedToModify(data.group_id, req.user_id)) {
            const result = await Layer[action](...actionData)
            if (result) {
              return res.send({success: true, action, layer_id: result[0]})
            } else {
              return res.send({success: false, error: 'Failed to Create Layer'})
            }
          } else {
            return notAllowedError(res, 'layer')
          }
        } else {
          if (await Layer.allowedToModify(data.layer_id, req.user_id)) {
            const result = await Layer[action](...actionData)
            if (result) {
              return res.send({success: true, action})
            } else {
              return res.send({success: false, error: 'Failed to Update Layer'})
            }
          } else {
            return notAllowedError(res, 'layer')
          }
        }
      } catch (err) { apiError(res, 500)(err) }
    } else {
      apiDataError(res)
    }
  })

  app.post('/api/layer/deletedata/:id', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const layer_id = parseInt(req.params.id || '', 10)
      if (await Layer.allowedToModify(layer_id, req.user_id)) {
        await DataLoadUtils.removeLayerData(layer_id)
        return res.status(200).send({success: true})
      } else {
        return notAllowedError(res, 'layer')
      }
    } catch (err) { apiError(res, 500)(err) }
  })

  app.post('/api/layer/presets/save', csrfProtection, isAuthenticated, (req, res) => {
    const data = req.body
    if (data && data.layer_id && data.presets && data.style && data.create !== undefined) {
      knex.transaction(async (trx) => {
        if (await Layer.allowedToModify(data.layer_id, req.user_id, trx)) {
          await Layer.savePresets(data.layer_id, data.presets, data.style, req.user_id, data.create, trx)
          if (data.create) {
            return res.status(200).send({success: true})
          } else {
          // update layer views and timestamp
            const layer = await Layer.getLayerByID(data.layer_id, trx)
            if (layer) {
              if (!layer.is_external) {
                await layerViews.replaceViews(data.layer_id, layer.presets, trx)
                // Mark layer as updated (tells vector tile service to reload)
                await trx('omh.layers').update(
                  {
                    updated_by_user_id: req.user_id,
                    last_updated: knex.raw('now()')
                  }
                ).where({layer_id: data.layer_id})
                return res.status(200).send({success: true})
              } else {
              // Mark layer as updated
                await trx('omh.layers').update(
                  {
                    updated_by_user_id: req.user_id,
                    last_updated: knex.raw('now()')
                  }
                ).where({layer_id: data.layer_id})
                return res.status(200).send({success: true})
              }
            } else {
              return res.status(200).send({success: false, error: 'layer not found'})
            }
          }
        } else {
          return notAllowedError(res, 'layer')
        }
      }).catch(apiError(res, 500))
    } else {
      apiDataError(res)
    }
  })

  app.post('/api/layer/notes/save', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.layer_id && data.notes) {
        if (await Layer.allowedToModify(data.layer_id, req.user_id)) {
          await Layer.saveLayerNote(data.layer_id, req.user_id, data.notes)
          return res.send({success: true})
        } else {
          return notAllowedError(res, 'layer')
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 500)(err) }
  })

  app.post('/api/layer/addphotopoint', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.layer_id && data.geoJSON && data.image && data.imageInfo) {
        let geoJSON = data.geoJSON
        if (data.geoJSON.type === 'FeatureCollection') {
          const firstFeature = data.geoJSON.features[0]
          geoJSON = firstFeature
        }

        if (await Layer.allowedToModify(data.layer_id, req.user_id)) {
          knex.transaction(async (trx) => {
            const layer = await Layer.getLayerByID(data.layer_id, trx)
            if (layer) {
              const mhid = await LayerData.createFeature(data.layer_id, geoJSON, trx)
              if (mhid) {
              // get the mhid for the new feature
                debug.log(`new mhid: ${mhid}`)
                const photo_id = await PhotoAttachment.setPhotoAttachment(layer.layer_id, mhid, data.image, data.imageInfo, req.user_id, trx)
                const photo_url = `${urlUtil.getBaseUrl()}/feature/photo/${photo_id}.jpg`
                // add a tag to the feature
                await LayerData.setStringTag(layer.layer_id, mhid, 'photo_url', photo_url, trx)

                const presets = await PhotoAttachment.addPhotoUrlPreset(layer, req.user_id, trx)
                await layerViews.replaceViews(data.layer_id, presets, trx)
                return res.send({success: true, photo_id, photo_url, mhid})
              } else {
                return res.send({success: false, error: 'error creating feature'})
              }
            } else {
              return res.send({success: false, error: 'layer not found'})
            }
          })
        } else {
          notAllowedError(res, 'layer')
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 500)(err) }
  })
}
