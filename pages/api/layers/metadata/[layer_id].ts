import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../src/auth/check-user'
import { apiError } from '../../../../src/services/error-response'
import LayerModel from '../../../../src/models/layer'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'

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
    const layer_id = Number.parseInt(req.query.layer_id as string)
    const layer = await LayerModel.getLayerByID(layer_id)

    // inject this site's URL into the style source, to support remote layers
    for (const key of Object.keys(layer.style.sources)) {
      const source = layer.style.sources[key] as mapboxgl.VectorSource

      if (source.url) {
        source.url = source.url.replace(
          '{MAPHUBS_DOMAIN}',
          urlUtil.getBaseUrl()
        )
      }
    }
    return res.status(200).json({
      success: true,
      layer
    })
  } catch (err) {
    apiError(res, 500)(err)
  }
}
export default handler
