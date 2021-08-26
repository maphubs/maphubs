import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../../../src/auth/check-user'
import LayerModel from '../../../../../../src/models/layer'
import { apiError } from '../../../../../../src/services/error-response'
import { manetCheck } from '../../../../../../src/services/manet-check'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const handler: NextApiHandler = async (req, res) => {
  const shortid = req.query.shortid as string

  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }

  try {
    const isShared = await LayerModel.isSharedInPublicMap(shortid)
    const layer = await LayerModel.getLayerByShortID(shortid)

    if (
      process.env.NEXT_PUBLIC_REQUIRE_LOGIN !== 'true' || // login not required
      isShared || // in public shared map
      manetCheck(req) || // screenshot service
      (user?.sub && isMember(user)) // logged in
    ) {
      const geoJSON = await LayerModel.getGeoJSON(layer.layer_id)
      res.status(200).send(geoJSON)
    } else {
      res.status(404).send('')
    }
  } catch (err) {
    apiError(res, 200)(err)
  }
}
export default handler
