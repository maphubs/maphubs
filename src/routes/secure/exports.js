// @flow
import MapStyles from '../../components/Map/Styles'
import Locales from '../../services/locales'
const Layer = require('../../models/layer')
const Feature = require('../../models/feature')
const apiError = require('../../services/error-response').apiError
const ogr2ogr = require('ogr2ogr')
const tokml = require('tokml')
const debug = require('../../services/debug')('exports')
const privateLayerCheck = require('../../services/private-layer-check').middleware
const knex = require('../../connection.js')
const geojson2dsv = require('geojson2dsv')
const exportUtils = require('../../services/export-utils')

module.exports = function (app: any) {
  app.get('/api/layer/:layer_id/export/json/*', privateLayerCheck, (req, res) => {
    const layer_id = parseInt(req.params.layer_id || '', 10)
    Layer.getGeoJSON(layer_id).then((geoJSON) => {
      return res.status(200).send(geoJSON)
    }).catch(apiError(res, 200))
  })

  app.get('/api/layer/:layer_id/export/svg/*', privateLayerCheck, async (req, res) => {
    try {
      const layer_id = parseInt(req.params.layer_id || '', 10)
      const layer = await Layer.getLayerByID(layer_id)
      if (layer) {
        const table = `layers.data_${layer.layer_id}`
        const featureSVGs = await knex.raw(`select ST_AsSVG(ST_Transform(wkb_geometry, 900913)) as svg from :table:;`, {table})
        let bounds = await knex.raw(`select ST_XMin(bbox)::float as xmin, 
            ST_YMin(bbox)::float as ymin, 
            ST_XMax(bbox)::float as xmax, ST_YMax(bbox)::float as ymax 
            from (select ST_Extent(ST_Transform(wkb_geometry, 900913)) as bbox from :table:) a`, {table})
        bounds = bounds.rows[0]

        let paths = ''

        const savedColor = MapStyles.settings.get(layer.style, 'color')
        const color = savedColor || '#FF0000'

        if (layer.data_type === 'point') {
          featureSVGs.rows.forEach((row) => {
            paths += `<path d="${row.svg}"></path>`
          })
        } else if (layer.data_type === 'line') {
          featureSVGs.rows.forEach((row) => {
            paths += `<path d="${row.svg}"></path>`
          })
        } else if (layer.data_type === 'polygon') {
          featureSVGs.rows.forEach((row) => {
            paths += `<path fill="${color}" stroke="black" stroke-width="3000" d="${row.svg}"></path>`
          })
        }

        const width = bounds.xmax - bounds.xmin
        const height = bounds.ymax - bounds.ymin

        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg"
          id="maphubs-layer-${layer.layer_id}" viewBox="${bounds.xmin} ${bounds.ymin} ${width} ${height * 2}" preserveAspectRatio="xMidYMid meet">
          ${paths}
          </svg>
          `

        res.header('Content-Type', 'image/svg+xml')
        return res.status(200).send(svg)
      } else {
        return res.status(404).send()
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.get('/api/layer/:layer_id/export/csv/*', privateLayerCheck, (req, res) => {
    const layer_id = parseInt(req.params.layer_id || '', 10)

    Layer.getGeoJSON(layer_id).then((geoJSON) => {
      const resultStr = JSON.stringify(geoJSON)
      const hash = require('crypto').createHash('md5').update(resultStr).digest('hex')
      const match = req.get('If-None-Match')
      /* eslint-disable security/detect-possible-timing-attacks */
      // We freely give out the Etag hash, don't need to protect against someone brute forcing it
      if (hash === match) {
        return res.status(304).send()
      } else {
        res.header('Content-Type', 'text/csv')
        res.header('ETag', hash)

        const csvString = geojson2dsv(geoJSON, ',', true)

        return res.status(200).send(csvString)
      }
    }).catch(apiError(res, 200))
  })

  app.get('/api/layer/:layer_id/export/geobuf/*', privateLayerCheck, (req, res) => {
    const layer_id = parseInt(req.params.layer_id || '', 10)
    exportUtils.completeGeoBufExport(req, res, layer_id)
  })

  app.get('/api/layer/:layer_id/export/maphubs/*', privateLayerCheck, (req, res) => {
    const layer_id = parseInt(req.params.layer_id || '', 10)
    exportUtils.completeMapHubsExport(req, res, layer_id)
  })

  app.get('/api/layer/:layer_id/export/kml/*', privateLayerCheck, async (req, res) => {
    try {
      const layer_id = parseInt(req.params.layer_id || '', 10)
      const geoJSON = await Layer.getGeoJSON(layer_id)
      const layer = await Layer.getLayerByID(layer_id)
      if (layer) {
        const geoJSONStr = JSON.stringify(geoJSON)
        const hash = require('crypto').createHash('md5').update(geoJSONStr).digest('hex')
        const match = req.get('If-None-Match')
        if (hash === match) {
          return res.status(304).send()
        } else {
          res.header('Content-Type', 'application/vnd.google-earth.kml+xml')
          res.header('ETag', hash)

          geoJSON.features.map((feature) => {
            if (feature.properties) {
              if (layer.data_type === 'polygon') {
                feature.properties['stroke'] = '#212121'
                feature.properties['stroke-width'] = 2
                feature.properties['fill'] = '#FF0000'
                feature.properties['fill-opacity'] = 0.5
              } else if (layer.data_type === 'line') {
                feature.properties['stroke'] = '#FF0000'
                feature.properties['stroke-width'] = 2
              } else if (layer.data_type === 'point') {
                feature.properties['marker-color'] = '#FF0000'
                feature.properties['marker-size'] = 'medium'
              }
            }
          })

          const name = Locales.getLocaleStringObject(req.locale, layer.name)
          const description = Locales.getLocaleStringObject(req.locale, layer.description)
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
    } catch (err) { apiError(res, 200)(err) }
  })

  app.get('/api/feature/:layer_id/:id/export/kml/*', privateLayerCheck, async (req, res, next) => {
    try {
      const layer_id = parseInt(req.params.layer_id || '', 10)
      const id = req.params.id

      const mhid = `${layer_id}:${id}`

      if (mhid && layer_id) {
        const layer = await Layer.getLayerByID(layer_id)
        if (layer) {
          const geoJSON = await Feature.getGeoJSON(mhid, layer.layer_id)
          const geoJSONStr = JSON.stringify(geoJSON)
          const hash = require('crypto').createHash('md5').update(geoJSONStr).digest('hex')
          const match = req.get('If-None-Match')
          if (hash === match) {
            return res.status(304).send()
          } else {
            res.header('Content-Type', 'application/vnd.google-earth.kml+xml')
            res.header('ETag', hash)

            geoJSON.features.map((feature) => {
              if (feature.properties) {
                if (layer.data_type === 'polygon') {
                  feature.properties['stroke'] = '#212121'
                  feature.properties['stroke-width'] = 2
                  feature.properties['fill'] = '#FF0000'
                  feature.properties['fill-opacity'] = 0.5
                } else if (layer.data_type === 'line') {
                  feature.properties['stroke'] = '#FF0000'
                  feature.properties['stroke-width'] = 2
                } else if (layer.data_type === 'point') {
                  feature.properties['marker-color'] = '#FF0000'
                  feature.properties['marker-size'] = 'medium'
                }
              }
            })

            const name = Locales.getLocaleStringObject(req.locale, layer.name)
            const description = Locales.getLocaleStringObject(req.locale, layer.description)
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
    } catch (err) { apiError(res, 200)(err) }
  })

  app.get('/api/layer/:layer_id/export/gpx/*', privateLayerCheck, (req, res) => {
    const layer_id = parseInt(req.params.layer_id || '', 10)
    Layer.getGeoJSON(layer_id).then((geoJSON) => {
      const resultStr = JSON.stringify(geoJSON)
      const hash = require('crypto').createHash('md5').update(resultStr).digest('hex')
      const match = req.get('If-None-Match')
      if (hash === match) {
        return res.status(304).send()
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/gpx+xml',
          'ETag': hash
        })
        return ogr2ogr(geoJSON)
          .format('GPX')
          .skipfailures()
          .options(['-t_srs', 'EPSG:4326', '-dsco', 'GPX_USE_EXTENSIONS=YES'])
          .timeout(60000)
          .stream()
          .pipe(res)
      }
    }).catch(apiError(res, 200))
  })

  app.get('/api/layer/:layer_id/export/shp/*', privateLayerCheck, (req, res) => {
    const layer_id = parseInt(req.params.layer_id || '', 10)

    Layer.getGeoJSON(layer_id).then((geoJSON) => {
      const resultStr = JSON.stringify(geoJSON)
      const hash = require('crypto').createHash('md5').update(resultStr).digest('hex')
      const match = req.get('If-None-Match')
      if (hash === match) {
        return res.status(304).send()
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/zip',
          'ETag': hash
        })

        return ogr2ogr(geoJSON)
          .format('ESRI Shapefile')
          .skipfailures()
          .options(['-t_srs', 'EPSG:4326'])
          .timeout(60000)
          .stream()
          .pipe(res)
      }
    }).catch(apiError(res, 200))
  })
}
