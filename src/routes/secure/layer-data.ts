import Layer from '../../models/layer'
import LayerData from '../../models/layer-data'
import csurf from 'csurf'
import knex from '../../connection'
import Promise from 'bluebird'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { apiError, notAllowedError } from '../../services/error-response'
import isAuthenticated from '../../services/auth-check'

const debug = DebugService('routes/layer-data')

const csrfProtection = csurf({
  cookie: false
})

export default function (app: any): void {
  /**
   * When enabled, allows a public user to submit a single feature to the layer
   */
  app.post('/api/layer/public/submit', async (req, res) => {
    try {
      const data = req.body

      if (data && data.layer_id && data.feature) {
        const layer = await Layer.getLayerByID(data.layer_id)

        return layer.allow_public_submit
          ? knex.transaction(async (trx) => {
              await LayerData.createFeature(data.layer_id, data.feature, trx)
              await Layer.setUpdated(data.layer_id, req.user_id, trx)
              debug.log('feature submission complete')
              return res.status(200).send({
                success: true
              })
            })
          : notAllowedError(res, 'layer')
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
          return (await Layer.allowedToModify(data.layer_id, req.user_id))
            ? knex.transaction(async (trx) => {
                await Promise.map(data.edits, (edit) => {
                  switch (edit.status) {
                    case 'create': {
                      return LayerData.createFeature(
                        data.layer_id,
                        edit.geojson,
                        trx
                      )
                    }
                    case 'modify': {
                      return LayerData.updateFeature(
                        data.layer_id,
                        edit.geojson.id,
                        edit.geojson,
                        trx
                      )
                    }
                    case 'delete': {
                      return LayerData.deleteFeature(
                        data.layer_id,
                        edit.geojson.id,
                        trx
                      )
                    }
                    // No default
                  }
                })
                await Layer.setUpdated(data.layer_id, req.user_id, trx)
                debug.log('save edits complete')
                return res.status(200).send({
                  success: true
                })
              })
            : notAllowedError(res, 'layer')
        } else {
          apiDataError(res)
        }
      } catch (err) {
        apiError(res, 500)(err)
      }
    }
  )
}
