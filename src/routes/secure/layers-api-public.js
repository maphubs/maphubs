// @flow
import Locales from '../../services/locales'
const Layer = require('../../models/layer')
// var log = require('../../services/log');
// var debug = require('../../services/debug')('routes/layers');
const urlUtil = require('../../services/url-util')
const apiError = require('../../services/error-response').apiError
const privateLayerCheck = require('../../services/private-layer-check').middleware
// Layer API Endpoints that do not require authentication

module.exports = function (app: any) {
  app.get('/api/layers/search/suggestions', (req, res) => {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc')
      return
    }
    const q = req.query.q
    Layer.getSearchSuggestions(q)
      .then((result) => {
        const suggestions = []
        result.forEach((layer) => {
          const name = Locales.getLocaleStringObject(req.locale, layer.name)
          suggestions.push({key: layer.layer_id, value: name})
        })
        return res.send({suggestions})
      }).catch(apiError(res, 500))
  })

  app.get('/api/layers/search', (req, res) => {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc')
      return
    }
    let userId
    if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
      userId = req.session.user.maphubsUser.id
    }
    Layer.getSearchResults(req.query.q)
      .then(async (layers) => {
        if (userId) {
          await Layer.attachPermissionsToLayers(layers, userId)
        }
        return res.status(200).send({layers})
      }).catch(apiError(res, 500))
  })

  app.get('/api/layer/info/:layer_id', privateLayerCheck, (req, res) => {
    const layerId = parseInt(req.params.layer_id || '', 10)
    Layer.getLayerInfo(layerId)
      .then((layer) => {
        return res.status(200).send({success: true, layer})
      }).catch(apiError(res, 500))
  })

  app.get('/api/layer/metadata/:layer_id', privateLayerCheck, (req, res) => {
    const layerId = parseInt(req.params.layer_id || '', 10)
    Layer.getLayerByID(layerId)
      .then((layer) => {
      // inject this site's URL into the style source, to support remote layers
        Object.keys(layer.style.sources).forEach((key) => {
          const source = layer.style.sources[key]
          if (source.url) {
            source.url = source.url.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl())
          }
        })
        return res.status(200).send({success: true, layer})
      }).catch(apiError(res, 500))
  })
}
