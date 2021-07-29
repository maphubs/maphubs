import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import LayerModel from '../../../src/models/layer'
import LayerData from '../../../src/models/layer-data'
import knex from '../../../src/connection'
import layerViews from '../../../src/services/layer-views'
import PhotoAttachment from '../../../src/models/photo-attachment'
import { isMember } from '../../../src/auth/check-user'
import {
  apiDataError,
  apiError,
  notAllowedError
} from '../../../src/services/error-response'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'

const debug = DebugService('api/layer/addphotopoint')

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const addPhotoPoint: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }
  if (!user?.sub || !isMember(user)) {
    return res.status(401).json({
      error: 'Login required'
    })
  }
  const user_id = Number.parseInt(user.sub)
  try {
    const data = req.body

    if (
      data &&
      data.layer_id &&
      data.geoJSON &&
      data.imageUrl &&
      data.imageInfo
    ) {
      let geoJSON = data.geoJSON

      if (data.geoJSON.type === 'FeatureCollection') {
        const firstFeature = data.geoJSON.features[0]
        geoJSON = firstFeature
      }

      if (await LayerModel.allowedToModify(data.layer_id, user_id)) {
        knex.transaction(async (trx) => {
          const layer = await LayerModel.getLayerByID(data.layer_id, trx)

          if (layer) {
            const mhid = await LayerData.createFeature(
              data.layer_id,
              geoJSON,
              trx
            )

            if (mhid) {
              // get the mhid for the new feature
              debug.log(`new mhid: ${mhid}`)
              const photo_url = await PhotoAttachment.setPhotoAttachment(
                layer.layer_id,
                mhid,
                data.image,
                data.imageInfo,
                user_id,
                trx
              )
              // add a tag to the feature
              await LayerData.setStringTag(
                layer.layer_id,
                mhid,
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
              return res.status(200).json({
                success: true,
                photo_url,
                mhid
              })
            } else {
              return res.status(200).json({
                success: false,
                error: 'error creating feature'
              })
            }
          } else {
            return res.status(200).json({
              success: false,
              error: 'layer not found'
            })
          }
        })
      } else {
        notAllowedError(res, 'layer')
      }
    } else {
      apiDataError(res)
    }
  } catch (err) {
    apiError(res, 500)(err)
  }
}
export default addPhotoPoint

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb'
    }
  }
}
