import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../src/auth/check-user'
import MapModel from '../../../../src/models/map'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const handler: NextApiHandler = async (req, res) => {
  const map_id = Number.parseInt(req.query.map_id as string)

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
  const map = await MapModel.getMap(map_id)
  const layers = await MapModel.getMapLayers(map_id)
  return res.status(200).json({
    success: true,
    map,
    layers
  })
}
export default handler
