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

const featureAddPhoto: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }
  const user_id = Number.parseInt(user.sub)

  const data = req.body

  if (data && data.layer_id && data.mhid && data.image && data.info) {
    try {
      return (await LayerModel.allowedToModify(data.layer_id, user_id))
        ? knex.transaction(async (trx) => {
            // set will replace existing photo
            const photo_url = await PhotoAttachment.setPhotoAttachment(
              data.layer_id,
              data.mhid,
              data.image,
              data.info,
              user_id,
              trx
            )
            // add a tag to the feature and update the layer
            const layer = await LayerModel.getLayerByID(data.layer_id, trx)

            if (layer) {
              await LayerData.setStringTag(
                layer.layer_id,
                data.mhid,
                'photo_url',
                photo_url,
                trx
              )
              const presets = await PhotoAttachment.addPhotoUrlPreset(
                layer,
                user_id,
                trx
              )
              await layerViews.replaceViews(data.layer_id, presets, trx)
              await LayerModel.setUpdated(data.layer_id, user_id, trx)
              return res.status(200).json({
                success: true,
                photo_url
              })
            } else {
              return res.status(200).json({
                success: false,
                error: 'layer not found'
              })
            }
          })
        : notAllowedError(res, 'layer')
    } catch (err) {
      apiError(res, 500)(err)
    }
  } else {
    apiDataError(res)
  }
}
export default featureAddPhoto
