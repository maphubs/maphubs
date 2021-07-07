import MapStyles from '../../components/Map/Styles'
import Locales from '../../services/locales'
import Layer from '../../models/layer'
import Feature from '../../models/feature'
import { apiError } from '../../services/error-response'
import ogr2ogr from 'ogr2ogr'
import tokml from '@maphubs/tokml'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import knex from '../../connection'
import geojson2dsv from 'geojson2dsv'
import exportUtils from '../../services/export-utils'
import Crypto from 'crypto'

const debug = DebugService('exports')

export default function (app: any) {
  app.get('/api/layer/:layer_id/export/json/*', async (req, res) => {
    const layer_id = Number.parseInt(req.params.layer_id || '', 10)
    let aggFields

    if (req.query.agg) {
      aggFields = req.query.agg.split(',')
    }

    try {
      const geoJSON = await (aggFields
        ? Layer.getGeoJSONAgg(layer_id, aggFields)
        : Layer.getGeoJSON(layer_id))

      return res.status(200).send(geoJSON)
    } catch (err) {
      apiError(res, 200)(err)
    }
  })
  app.get('/api/layer/:layer_id/export/svg/*', async (req, res) => {
    try {
      const layer_id = Number.parseInt(req.params.layer_id || '', 10)
      const layer = await Layer.getLayerByID(layer_id)

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
        res.header('Content-Type', 'image/svg+xml')
        return res.status(200).send(svg)
      } else {
        return res.status(404).send()
      }
    } catch (err) {
      apiError(res, 200)(err)
    }
  })
  app.get('/api/layer/:layer_id/export/csv/*', async (req, res) => {
    const layer_id = Number.parseInt(req.params.layer_id || '', 10)
    let aggFields

    if (req.query.agg) {
      aggFields = req.query.agg.split(',')
    }

    try {
      const geoJSON = await (aggFields
        ? Layer.getGeoJSONAgg(layer_id, aggFields)
        : Layer.getGeoJSON(layer_id))

      // const resultStr = JSON.stringify(geoJSON)
      // const hash = require('crypto').createHash('md5').update(resultStr).digest('hex')
      // const match = req.get('If-None-Match')

      /* eslint-disable security/detect-possible-timing-attacks */
      // We freely give out the Etag hash, don't need to protect against someone brute forcing it
      // if (hash === match) {
      // return res.status(304).send()
      // } else {
      res.header('Content-Type', 'text/csv')
      // res.header('ETag', hash)
      const csvString = geojson2dsv(geoJSON, ',', true)
      return res.status(200).send(csvString) // }
    } catch (err) {
      apiError(res, 200)(err)
    }
  })
  app.get('/api/layer/:layer_id/export/geobuf/*', (req, res) => {
    const layer_id = Number.parseInt(req.params.layer_id || '', 10)
    exportUtils.completeGeoBufExport(req, res, layer_id)
  })
  app.get('/api/layer/:layer_id/export/maphubs/*', (req, res) => {
    const layer_id = Number.parseInt(req.params.layer_id || '', 10)
    exportUtils.completeMapHubsExport(req, res, layer_id)
  })
  app.get('/api/mapexport/:map_id/*', (req, res) => {
    const map_id = Number.parseInt(req.params.map_id || '', 10)
    exportUtils.completeMapHubsMapExport(req, res, map_id)
  })
  app.get('/api/layer/:layer_id/export/kml/*', async (req, res) => {
    try {
      const layer_id = Number.parseInt(req.params.layer_id || '', 10)
      let aggFields

      if (req.query.agg) {
        aggFields = req.query.agg.split(',')
      }

      const geoJSON = await (aggFields
        ? Layer.getGeoJSONAgg(layer_id, aggFields)
        : Layer.getGeoJSON(layer_id))

      const layer = await Layer.getLayerByID(layer_id)

      if (layer) {
        const geoJSONStr = JSON.stringify(geoJSON)

        const hash = Crypto.createHash('md5').update(geoJSONStr).digest('hex')

        const match = req.get('If-None-Match')

        if (hash === match) {
          return res.status(304).send()
        } else {
          res.header('Content-Type', 'application/vnd.google-earth.kml+xml')
          res.header('ETag', hash)
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
          const name = Locales.getLocaleStringObject(req.locale, layer.name)
          const description = Locales.getLocaleStringObject(
            req.locale,
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
        return res.status(404).send()
      }
    } catch (err) {
      apiError(res, 200)(err)
    }
  })
  app.get('/api/feature/:layer_id/:id/export/kml/*', async (req, res, next) => {
    try {
      const layer_id = Number.parseInt(req.params.layer_id || '', 10)
      const id = req.params.id

      if (id && layer_id) {
        const mhid = `${layer_id}:${id}`
        const layer = await Layer.getLayerByID(layer_id)

        if (layer) {
          const geoJSON = await Feature.getGeoJSON(mhid, layer.layer_id)
          const geoJSONStr = JSON.stringify(geoJSON)

          const hash = Crypto.createHash('md5').update(geoJSONStr).digest('hex')

          const match = req.get('If-None-Match')

          if (hash === match) {
            return res.status(304).send()
          } else {
            res.header('Content-Type', 'application/vnd.google-earth.kml+xml')
            res.header('ETag', hash)
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
            const name = Locales.getLocaleStringObject(req.locale, layer.name)
            const description = Locales.getLocaleStringObject(
              req.locale,
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
          return res.status(404).send()
        }
      } else {
        next(new Error('Missing Required Data'))
      }
    } catch (err) {
      apiError(res, 200)(err)
    }
  })
  app.get('/api/layer/:layer_id/export/gpx/*', (req, res) => {
    const layer_id = Number.parseInt(req.params.layer_id || '', 10)
    Layer.getGeoJSON(layer_id)
      .then((geoJSON) => {
        const resultStr = JSON.stringify(geoJSON)

        const hash = Crypto.createHash('md5').update(resultStr).digest('hex')

        const match = req.get('If-None-Match')

        if (hash === match) {
          return res.status(304).send()
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
      })
      .catch(apiError(res, 200))
  })
  app.get('/api/layer/:layer_id/export/shp/*', async (req, res) => {
    const layer_id = Number.parseInt(req.params.layer_id || '', 10)
    let aggFields

    if (req.query.agg) {
      aggFields = req.query.agg.split(',')
    }

    try {
      const geoJSON = await (aggFields
        ? Layer.getGeoJSONAgg(layer_id, aggFields)
        : Layer.getGeoJSON(layer_id))

      res.writeHead(200, {
        'Content-Type': 'application/zip'
      })
      return ogr2ogr(geoJSON)
        .format('ESRI Shapefile')
        .skipfailures()
        .options(['-t_srs', 'EPSG:4326'])
        .timeout(60_000)
        .stream()
        .pipe(res)
    } catch (err) {
      apiError(res, 200)(err)
    }
  })
}
