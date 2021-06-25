const Layer = require('../../models/layer')

const LayerData = require('../../models/layer-data')

const csrfProtection = require('csurf')({
  cookie: false
})

const knex = require('../../connection')

const Promise = require('bluebird')

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')(
  'routes/layer-data'
)

const apiError = require('../../services/error-response').apiError

const apiDataError = require('../../services/error-response').apiDataError

const notAllowedError = require('../../services/error-response').notAllowedError

const isAuthenticated = require('../../services/auth-check')

module.exports = function (app: any) {
  /**
   * When enabled, allows a public user to submit a single feature to the layer
   */
  app.post('/api/layer/public/submit', async (req, res) => {
    try {
      const data = req.body

      if (data && data.layer_id && data.feature) {
        const layer = await Layer.getLayerByID(data.layer_id)

        if (layer.allow_public_submit) {
          return knex.transaction(async (trx) => {
            await LayerData.createFeature(data.layer_id, data.feature, trx)
            await Layer.setUpdated(data.layer_id, req.user_id, trx)
            debug.log('feature submission complete')
            return res.status(200).send({
              success: true
            })
          })
        } else {
          return notAllowedError(res, 'layer')
        }
      } else {
        apiDataError(res)
      }
    } catch (err) {
      apiError(res, 500)(err)
    }
  })
  app.post(
    '/api/edits/save',
    csrfProtection,
    isAuthenticated,
    async (req, res) => {
      try {
        const data = req.body

        if (data && data.layer_id && data.edits) {
          if (await Layer.allowedToModify(data.layer_id, req.user_id)) {
            return knex.transaction(async (trx) => {
              await Promise.map(data.edits, (edit) => {
                if (edit.status === 'create') {
                  return LayerData.createFeature(
                    data.layer_id,
                    edit.geojson,
                    trx
                  )
                } else if (edit.status === 'modify') {
                  return LayerData.updateFeature(
                    data.layer_id,
                    edit.geojson.id,
                    edit.geojson,
                    trx
                  )
                } else if (edit.status === 'delete') {
                  return LayerData.deleteFeature(
                    data.layer_id,
                    edit.geojson.id,
                    trx
                  )
                }
              })
              await Layer.setUpdated(data.layer_id, req.user_id, trx)
              debug.log('save edits complete')
              return res.status(200).send({
                success: true
              })
            })
          } else {
            return notAllowedError(res, 'layer')
          }
        } else {
          apiDataError(res)
        }
      } catch (err) {
        apiError(res, 500)(err)
      }
    }
  )
}