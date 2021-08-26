import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../src/auth/check-user'
import { apiError } from '../../../../src/services/error-response'
import LayerModel from '../../../../src/models/layer'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const handler: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }

  if (
    process.env.NEXT_PUBLIC_REQUIRE_LOGIN === 'true' &&
    (!user?.sub || !isMember(user))
  ) {
    return res.status(401).json({
      error: 'Login required'
    })
  }
  try {
    const layerId = Number.parseInt(req.query.layer_id as string)
    return res.status(200).json({
      success: true,
      layer: await LayerModel.getLayerInfo(layerId)
    })
  } catch (err) {
    apiError(res, 500)(err)
  }
}
export default handler
