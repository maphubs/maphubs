import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import LayerModel from '../../../../src/models/layer'
import FeatureModel from '../../../../src/models/feature'
import { isMember } from '../../../../src/auth/check-user'
import { apiError, apiDataError } from '../../../../src/services/error-response'
import Crypto from 'crypto'
import { LineString } from 'geojson'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const featureGPXExport: NextApiHandler = async (req, res) => {
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

  if (req.query.featuregpx.length === 2) {
    const id = req.query.featuregpx[1]
    const layer_id = Number.parseInt(req.query.featuregpx[0])
    try {
      const mhid = `${layer_id}:${id}`
      const layer = await LayerModel.getLayerByID(layer_id)

      if (layer) {
        const geoJSON = await FeatureModel.getGeoJSON(mhid, layer.layer_id)
        const firstFeature = geoJSON.features[0]
        const firstGeometry = firstFeature.geometry as LineString
        firstGeometry.type = 'LineString'
        const coordinates = firstGeometry.coordinates[0] //[0]
        //log.info(coordinates)
        const resultStr = JSON.stringify(geoJSON)
        //log.info(resultStr)

        const hash = Crypto.createHash('md5').update(resultStr).digest('hex')

        const match = req.headers['If-None-Match']

        // not being used for auth, just the Etag check
        // eslint-disable-next-line security/detect-possible-timing-attacks
        if (hash === match) {
          return res.status(304).send('')
        } else {
          res.writeHead(200, {
            'Content-Type': 'application/gpx+xml',
            ETag: hash
          })
          let gpx = `
          <gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="MapHubs">
            <metadata>
              <link href="https://maphubs.com">
                <text>MapHubs</text>
              </link>
            </metadata>
            <trk>
              <name>Feature</name>
              <trkseg>
              `
          for (const coord of coordinates) {
            gpx += ` <trkpt lon="${coord[0]}" lat="${coord[1]}"></trkpt>`
          }
          gpx += `
              </trkseg>
            </trk>
            </gpx>`
          return res.end(gpx)
        }
      } else {
        res.status(404).send('Not Found')
      }
    } catch (err) {
      apiError(res, 500)(err)
    }
  } else {
    apiDataError(res)
  }
}
export default featureGPXExport
