// @flow
const Layer = require('../models/layer')
const geobuf = require('geobuf')
const Pbf = require('pbf')
const apiError = require('../services/error-response').apiError
const version = require('../../version.json').version
const local = require('../local')
const moment = require('moment')

module.exports = {

  completeGeoBufExport (req: any, res: any, layer_id: number, temp: boolean = false) {
    Layer.getGeoJSON(layer_id, temp).then((geoJSON) => {
      const resultStr = JSON.stringify(geoJSON)
      const hash = require('crypto').createHash('md5').update(resultStr).digest('hex')
      const match = req.get('If-None-Match')
      /* eslint-disable security/detect-possible-timing-attacks */
      if (hash === match) {
        return res.status(304).send()
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'ETag': hash
        })

        const data = geobuf.encode(geoJSON, new Pbf())
        const buf = Buffer.from(data, 'binary')
        return res.end(buf, 'binary')
      }
    }).catch(apiError(res, 200))
  },

  completeMapHubsExport (req: any, res: any, layer_id: number) {
    Layer.getLayerByID(layer_id)
      .then(layer => {
        return Layer.getGeoJSON(layer_id).then((geoJSON) => {
          geoJSON.maphubs = {
            version: 1,
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
              'ETag': hash
            })

            const data = geobuf.encode(geoJSON, new Pbf())
            const buf = Buffer.from(data, 'binary')
            return res.end(buf, 'binary')
          }
        })
      }).catch(apiError(res, 200))
  }
}
