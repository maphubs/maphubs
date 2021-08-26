import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../../../src/auth/check-user'
import LayerModel from '../../../../../../src/models/layer'
import { apiError } from '../../../../../../src/services/error-response'
import Crypto from 'crypto'
import Locales from '../../../../../../src/services/locales'
import tokml from '@maphubs/tokml'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'

const debug = DebugService('export KML')

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const handler: NextApiHandler = async (req, res) => {
  const layer_id = Number.parseInt(req.query.layer_id as string)
  const locale = (req.query.locale as string) || 'en'

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
    let aggFields

    if (req.query.agg) {
      const agg = req.query.agg as string
      aggFields = agg.split(',')
    }

    const geoJSON = await (aggFields
      ? LayerModel.getGeoJSONAgg(layer_id, aggFields)
      : LayerModel.getGeoJSON(layer_id))

    const layer = await LayerModel.getLayerByID(layer_id)

    if (layer) {
      const geoJSONStr = JSON.stringify(geoJSON)

      const hash = Crypto.createHash('md5').update(geoJSONStr).digest('hex')

      const match = req.headers['If-None-Match']

      // eslint-disable-next-line security/detect-possible-timing-attacks
      if (hash === match) {
        return res.status(304).send('')
      } else {
        res.setHeader('Content-Type', 'application/vnd.google-earth.kml+xml')
        res.setHeader('ETag', hash)
        geoJSON.features.map((feature) => {
          if (feature.properties) {
            switch (layer.data_type) {
              case 'polygon': {
                feature.properties.stroke = '#323333'
                feature.properties['stroke-width'] = 2
                feature.properties.fill = '#FF0000'
                feature.properties['fill-opacity'] = 0.5

                break
              }
              case 'line': {
                feature.properties.stroke = '#FF0000'
                feature.properties['stroke-width'] = 2

                break
              }
              case 'point': {
                feature.properties['marker-color'] = '#FF0000'
                feature.properties['marker-size'] = 'medium'

                break
              }
              // No default
            }
          }
        })
        const name = Locales.getLocaleStringObject(locale, layer.name)
        const description = Locales.getLocaleStringObject(
          locale,
          layer.description
        )
        const kml = tokml(geoJSON, {
          name: 'name',
          description: 'description',
          documentName: name,
          documentDescription: description,
          simplestyle: true
        })
        debug.log('KML Generated')
        return res.status(200).send(kml)
      }
    } else {
      return res.status(404).send('Not Found')
    }
  } catch (err) {
    apiError(res, 200)(err)
  }
}
export default handler
