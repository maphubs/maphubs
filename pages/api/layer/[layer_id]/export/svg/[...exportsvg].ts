import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../../../src/auth/check-user'
import LayerModel from '../../../../../../src/models/layer'
import { apiError } from '../../../../../../src/services/error-response'
import knex from '../../../../../../src/connection'
import MapStyles from '../../../../../../src/components/Maps/Map/Styles'

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
    const layer = await LayerModel.getLayerByID(layer_id)

    if (layer) {
      const table = `layers.data_${layer.layer_id}`
      const featureSVGs = await knex.raw(
        'select ST_AsSVG(ST_Transform(wkb_geometry, 900913)) as svg from :table:;',
        {
          table
        }
      )
      let bounds = await knex.raw(
        `select ST_XMin(bbox)::float as xmin, 
        ST_YMin(bbox)::float as ymin, 
        ST_XMax(bbox)::float as xmax, ST_YMax(bbox)::float as ymax 
        from (select ST_Extent(ST_Transform(wkb_geometry, 900913)) as bbox from :table:) a`,
        {
          table
        }
      )
      bounds = bounds.rows[0]
      let paths = ''
      const savedColor = MapStyles.settings.get(layer.style, 'color')
      const color = savedColor || '#FF0000'

      switch (layer.data_type) {
        case 'point': {
          for (const row of featureSVGs.rows) {
            paths += `<path d="${row.svg}"></path>`
          }

          break
        }
        case 'line': {
          for (const row of featureSVGs.rows) {
            paths += `<path d="${row.svg}"></path>`
          }

          break
        }
        case 'polygon': {
          for (const row of featureSVGs.rows) {
            paths += `<path fill="${color}" stroke="black" stroke-width="3000" d="${row.svg}"></path>`
          }

          break
        }
        // No default
      }

      const width = bounds.xmax - bounds.xmin
      const height = bounds.ymax - bounds.ymin
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg"
      id="maphubs-layer-${layer.layer_id}" viewBox="${bounds.xmin} ${
        bounds.ymin
      } ${width} ${height * 2}" preserveAspectRatio="xMidYMid meet">
      ${paths}
      </svg>
      `
      res.setHeader('Content-Type', 'image/svg+xml')
      return res.status(200).send(svg)
    } else {
      return res.status(404).send('')
    }
  } catch (err) {
    apiError(res, 200)(err)
  }
}
export default handler
