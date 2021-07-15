import Locales from '../../services/locales'
import Layer from '../../models/layer'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import { apiError } from '../../services/error-response'

/*
 * Layer API Endpoints that do not require authentication on public sites
 * These are protected if login is required globally
 */
export default function (app: any) {
  app.get('/api/layers/search/suggestions', async (req, res) => {
    try {
      if (!req.query.q) {
        res.status(400).send('Bad Request: Expected query param. Ex. q=abc')
        return
      }

      const result = await Layer.getSearchSuggestions(req.query.q)
      const suggestions = result.map((layer) => {
        return {
          key: layer.layer_id,
          value: Locales.getLocaleStringObject(req.locale, layer.name)
        }
      })
      res.send({
        suggestions
      })
    } catch (err) {
      apiError(res, 500)(err)
    }
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

      res.status(200).send({
        layers
      })
    } catch (err) {
      apiError(res, 500)(err)
    }
  })
  app.get('/api/layers/group/:group_id', async (req, res) => {
    try {
      const groupId = req.params.group_id
      let userId

      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        userId = req.session.user.maphubsUser.id
      }

      const layers = await Layer.getGroupLayers(groupId, true)

      if (userId) {
        await Layer.attachPermissionsToLayers(layers, userId)
      }

      res.status(200).send({
        layers
      })
    } catch (err) {
      apiError(res, 500)(err)
    }
  })
  app.get('/api/layer/info/:layer_id', async (req, res) => {
    try {
      const layerId = Number.parseInt(req.params.layer_id || '', 10)
      return res.status(200).send({
        success: true,
        layer: await Layer.getLayerInfo(layerId)
      })
    } catch (err) {
      apiError(res, 500)(err)
    }
  })
  app.get('/api/layer/metadata/:layer_id', async (req, res) => {
    const layerId = Number.parseInt(req.params.layer_id || '', 10)
    try {
      const layer = await Layer.getLayerByID(layerId)

      // inject this site's URL into the style source, to support remote layers
      for (const key of Object.keys(layer.style.sources)) {
        const source = layer.style.sources[key] as mapboxgl.VectorSource

        if (source.url) {
          source.url = source.url.replace(
            '{MAPHUBS_DOMAIN}',
            urlUtil.getBaseUrl()
          )
        }
      }
      return res.status(200).send({
        success: true,
        layer
      })
    } catch (err) {
      apiError(res, 500)(err)
    }
  })
}
