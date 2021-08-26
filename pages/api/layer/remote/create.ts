import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../src/auth/check-user'
import LayerModel from '../../../../src/models/layer'
import GroupModel from '../../../../src/models/group'
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
    if (req.body.group_id && req.body.layer && req.body.host) {
      if (await GroupModel.allowedToModify(req.body.group_id, user_id)) {
        const result = await LayerModel.createRemoteLayer(
          req.body.group_id,
          req.body.layer,
          req.body.host,
          user_id
        )

        return result
          ? res.status(200).json({
              success: true,
              layer_id: result[0]
            })
          : res.status(200).json({
              success: false,
              error: 'Failed to Create Layer'
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
export default handler
