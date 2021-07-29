import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import FeatureModel from '../../../../src/models/feature'
import { isMember } from '../../../../src/auth/check-user'
import { apiError, apiDataError } from '../../../../src/services/error-response'
import Crypto from 'crypto'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const featureJSONExport: NextApiHandler = async (req, res) => {
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

  if (req.query.featurejson.length === 2) {
    const id = req.query.featuregpx[1]
    const layer_id = Number.parseInt(req.query.featuregpx[0])
    const mhid = id.includes(':') ? id : `${layer_id}:${id}`
    try {
      const geoJSON = await FeatureModel.getGeoJSON(mhid, layer_id)
      const resultStr = JSON.stringify(geoJSON)

      const hash = Crypto.createHash('md5').update(resultStr).digest('hex')

      const match = req.headers['If-None-Match']

      /* eslint-disable security/detect-possible-timing-attacks */
      if (hash === match) {
        res.status(304).send('')
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          ETag: hash
        })
        res.end(resultStr)
      }

      return
    } catch (err) {
      apiError(res, 500)(err)
    }
  } else {
    apiDataError(res)
  }
}
export default featureJSONExport
