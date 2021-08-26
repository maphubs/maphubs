import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import LayerModel from '../../../../src/models/layer'
import layerViews from '../../../../src/services/layer-views'
import {
  apiError,
  notAllowedError,
  apiDataError
} from '../../../../src/services/error-response'
import PhotoAttachment from '../../../../src/models/photo-attachment'
import LayerData from '../../../../src/models/layer-data'

import knex from '../../../../src/connection'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const featureDeletePhoto: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }
  const user_id = Number.parseInt(user.sub)

  const data = req.body
  if (data && data.layer_id && data.mhid) {
    LayerModel.allowedToModify(data.layer_id, user_id)
      .then((allowed) => {
        return allowed
          ? knex
              .transaction(async (trx) => {
                // set will replace existing photo
                await PhotoAttachment.deletePhotoAttachment(
                  data.layer_id,
                  data.mhid,
                  trx
                )
                const layer = await LayerModel.getLayerByID(data.layer_id, trx)

                if (layer) {
                  // remove the photo URL from feature
                  await LayerData.setStringTag(
                    layer.layer_id,
                    data.mhid,
                    'photo_url',
                    null,
                    trx
                  )
                  await layerViews.replaceViews(
                    data.layer_id,
                    layer.presets,
                    trx
                  )
                  await LayerModel.setUpdated(data.layer_id, user_id, trx)
                  return res.status(200).json({
                    success: true
                  })
                } else {
                  return res.status(200).json({
                    success: false,
                    error: 'layer not found'
                  })
                }
              })
              .catch(apiError(res, 500))
          : notAllowedError(res, 'layer')
      })
      .catch(apiError(res, 500))
  } else {
    apiDataError(res)
  }
}
export default featureDeletePhoto
