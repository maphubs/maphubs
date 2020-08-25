// @flow
const Layer = require('../models/layer')
const Map = require('../models/map')
const geobuf = require('geobuf')
const Pbf = require('pbf')
const apiError = require('../services/error-response').apiError
const version = require('../../version.json').version
const local = require('../local')
const moment = require('moment')
const Promise = require('bluebird')

module.exports = {

  completeGeoBufExport (req: any, res: any, layer_id: number) {
    Layer.getGeoJSON(layer_id).then((geoJSON) => {
      const resultStr = JSON.stringify(geoJSON)
      const hash = require('crypto').createHash('md5').update(resultStr).digest('hex')
      const match = req.get('If-None-Match')
      /* eslint-disable security/detect-possible-timing-attacks */
      if (hash === match) {
        return res.status(304).send()
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          ETag: hash
        })

        const data = geobuf.encode(geoJSON, new Pbf())
        const buf = Buffer.from(data, 'binary')
        return res.end(buf, 'binary')
      }
    }).catch(apiError(res, 200))
  },

  async completeMapHubsExport (req: any, res: any, layer_id: number) {
    try {
      const layer = await Layer.getLayerByID(layer_id)

      let geoJSON = {
        type: 'FeatureCollection',
        features: [],
        maphubs: {}
      }

      if (!layer.is_external && !layer.remote) {
        geoJSON = await Layer.getGeoJSON(layer_id)
      }
      geoJSON.maphubs = {
        version: 3,
        type: 'layer',
        systemVersion: version,
        exportTime: moment().format(),
        host: local.host,
        layer
      }

      const resultStr = JSON.stringify(geoJSON)
      const hash = require('crypto').createHash('md5').update(resultStr).digest('hex')
      const match = req.get('If-None-Match')
      /* eslint-disable security/detect-possible-timing-attacks */
      if (hash === match) {
        return res.status(304).send()
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          ETag: hash
        })

        const data = geobuf.encode(geoJSON, new Pbf())
        const buf = Buffer.from(data, 'binary')
        return res.end(buf, 'binary')
      }
    } catch (err) { apiError(res, 200)(err) }
  },

  async completeMapHubsMapExport (req: any, res: any, map_id: number) {
    try {
      const map = await Map.getMap(map_id)
      const mapLayers = await Map.getMapLayers(map_id, true)
      if (map && mapLayers) {
        const geoJSON = {
          type: 'FeatureCollection',
          features: [],
          maphubs: {}
        }

        await Promise.mapSeries(mapLayers, async (layer) => {
          if (!layer.is_external && !layer.remote) {
            const layerGeoJSON = await Layer.getGeoJSON(layer.layer_id)
            if (layerGeoJSON && layerGeoJSON.features) {
              layerGeoJSON.features.forEach(feature => {
                // label each feature by layer so we can combine then in one big GeoJSON
                feature.layer_short_id = layer.shortid
                geoJSON.features.push(feature)
              })
            }
          }
        })

        geoJSON.maphubs = {
          version: 3,
          type: 'map',
          systemVersion: version,
          exportTime: moment().format(),
          host: local.host,
          layers: mapLayers,
          map: {
            title: map.title,
            position: map.position,
            style: map.style,
            basemap: map.basemap,
            settings: map.settings
          }
        }

        const resultStr = JSON.stringify(geoJSON)
        const hash = require('crypto').createHash('md5').update(resultStr).digest('hex')
        const match = req.get('If-None-Match')
        /* eslint-disable security/detect-possible-timing-attacks */
        if (hash === match) {
          return res.status(304).send()
        } else {
          res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            ETag: hash
          })

          const data = geobuf.encode(geoJSON, new Pbf())
          const buf = Buffer.from(data, 'binary')
          return res.end(buf, 'binary')
        }
      } else {
        res.status(401).send('')
      }
    } catch (err) { apiError(res, 200)(err) }
  }
}
