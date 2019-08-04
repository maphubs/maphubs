// @flow
const Layer = require('../models/layer')
const geobuf = require('geobuf')
const Pbf = require('pbf')
const apiError = require('../services/error-response').apiError
const version = require('../../version.json').version
const local = require('../local')
const moment = require('moment')

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
        version: 2,
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
  }
}
