import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../src/auth/check-user'
import LayerModel from '../../../../src/models/layer'
import request from 'superagent'
import {
  apiError,
  apiDataError,
  notAllowedError
} from '../../../../src/services/error-response'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const handler: NextApiHandler = async (req, res) => {
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
    if (req.body.layer_id) {
      if (await LayerModel.allowedToModify(req.body.layer_id, user_id)) {
        const layer = await LayerModel.getLayerByID(req.body.layer_id)

        if (layer && layer.remote) {
          let url

          url = layer.remote_host === 'localhost' ? 'http://' : 'https://'

          url =
            url +
            layer.remote_host +
            '/api/layer/metadata/' +
            layer.remote_layer_id
          const response = await request.get(url)
          const result = await LayerModel.updateRemoteLayer(
            layer.layer_id,
            layer.owned_by_group_id,
            response.body.layer,
            layer.remote_host,
            user_id
          )

          return result
            ? res.status(200).json({
                success: true
              })
            : res.status(200).json({
                success: false,
                error: 'Failed to Update Layer'
              })
        } else {
          return res.status(200).json({
            success: false,
            error: 'Failed to Update Layer'
          })
        }
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
export default handler
