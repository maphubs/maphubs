// @flow
import Locales from '../../services/locales'
const Layer = require('../../models/layer')
const Group = require('../../models/group')
// var log = require('../../services/log');
// var debug = require('../../services/debug')('routes/layers');
const urlUtil = require('../../services/url-util')
const apiError = require('../../services/error-response').apiError
const privateLayerCheck = require('../../services/private-layer-check').middleware

/*
* Layer API Endpoints that do not require authentication on public sites
* These are protected if login is required globallay
*/

module.exports = function (app: any) {
  app.get('/api/layers/search/suggestions', async (req, res) => {
    try {
      if (!req.query.q) {
        res.status(400).send('Bad Request: Expected query param. Ex. q=abc')
        return
      }

      const result = await Layer.getSearchSuggestions(req.query.q)
      const suggestions = result.map(layer => {
        return {
          key: layer.layer_id,
          value: Locales.getLocaleStringObject(req.locale, layer.name)
        }
      })
      res.send({suggestions})
    } catch (err) { apiError(res, 500)(err) }
  })

  app.get('/api/layers/search', async (req, res) => {
    try {
      if (!req.query.q) {
        res.status(400).send('Bad Request: Expected query param. Ex. q=abc')
        return
      }
      let userId
      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        userId = req.session.user.maphubsUser.id
      }
      const layers = await Layer.getSearchResults(req.query.q)
      if (userId) {
        await Layer.attachPermissionsToLayers(layers, userId)
      }
      res.status(200).send({layers})
    } catch (err) { apiError(res, 500)(err) }
  })

  app.get('/api/layers/group/:group_id', async (req, res) => {
    try {
      const groupId = req.params.group_id
      let userId
      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        userId = req.session.user.maphubsUser.id
      }

      const includePrivate = userId && await Group.allowedToModify(groupId, userId)
      const layers = await Layer.getGroupLayers(groupId, includePrivate, true)

      if (userId) {
        await Layer.attachPermissionsToLayers(layers, userId)
      }

      res.status(200).send({layers})
    } catch (err) { apiError(res, 500)(err) }
  })

  app.get('/api/layer/info/:layer_id', privateLayerCheck, async (req, res) => {
    try {
      const layerId = parseInt(req.params.layer_id || '', 10)
      return res.status(200).send({
        success: true,
        layer: await Layer.getLayerInfo(layerId)
      })
    } catch (err) { apiError(res, 500)(err) }
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
