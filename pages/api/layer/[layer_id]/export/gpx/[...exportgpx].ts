import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../../../src/auth/check-user'
import LayerModel from '../../../../../../src/models/layer'
import { apiError } from '../../../../../../src/services/error-response'
import Crypto from 'crypto'
import ogr2ogr from 'ogr2ogr'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const handler: NextApiHandler = async (req, res) => {
  const layer_id = Number.parseInt(req.query.layer_id as string)

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
    const geoJSON = await LayerModel.getGeoJSON(layer_id)

    const resultStr = JSON.stringify(geoJSON)

    const hash = Crypto.createHash('md5').update(resultStr).digest('hex')

    const match = req.headers['If-None-Match']

    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (hash === match) {
      return res.status(304).send('')
    } else {
      res.writeHead(200, {
        'Content-Type': 'application/gpx+xml',
        ETag: hash
      })
      return ogr2ogr(geoJSON)
        .format('GPX')
        .skipfailures()
        .options(['-t_srs', 'EPSG:4326', '-dsco', 'GPX_USE_EXTENSIONS=YES'])
        .timeout(60_000)
        .stream()
        .pipe(res)
    }
  } catch (err) {
    apiError(res, 200)(err)
  }
}
export default handler
