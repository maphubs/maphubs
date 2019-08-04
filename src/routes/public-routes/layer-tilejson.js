// @flow
import slugify from 'slugify'
import Locales from '../../services/locales'
const Layer = require('../../models/layer')
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')

const apiError = require('../../services/error-response').apiError
const manetCheck = require('../../services/manet-check')
const privateLayerCheck = require('../../services/private-layer-check').check
const local = require('../../local')

/*
Note: this needs to be in public-routes since it is used by the screenshot service and by shared maps
*/

module.exports = function (app: any) {
  const completeLayerTileJSONRequest = function (req, res, layer) {
    if (!layer) {
      return res.status(404).send('TileJSON not supported for this layer')
    }
    const baseUrl = urlUtil.getBaseUrl()
    const name = Locales.getLocaleStringObject(req.locale, layer.name) || ''
    const description = Locales.getLocaleStringObject(req.locale, layer.description) || ''
    const source = Locales.getLocaleStringObject(req.locale, layer.source) || ''
    const legend = layer.legend_html ? layer.legend_html : name

    if (layer.is_external && layer.external_layer_config.type === 'raster') {
      let bounds = [-180, -85.05112877980659, 180, 85.0511287798066]
      if (layer.external_layer_config.bounds) {
        bounds = layer.external_layer_config.bounds
      } else if (layer.extent_bbox) {
        bounds = layer.extent_bbox
      }
      const minzoom = layer.external_layer_config.minzoom ? parseInt(layer.external_layer_config.minzoom) : 0
      const maxzoom = layer.external_layer_config.maxzoom ? parseInt(layer.external_layer_config.maxzoom) : 19

      const centerZoom = Math.floor((maxzoom - minzoom) / 2)
      const centerX = Math.floor((bounds[2] - bounds[0]) / 2)
      const centerY = Math.floor((bounds[3] - bounds[1]) / 2)
      const legend = layer.legend_html ? layer.legend_html : name

      const tileJSON = {
        attribution: source,
        autoscale: true,
        bounds,
        center: [centerX, centerY, centerZoom],
        created: layer.last_updated,
        description,
        legend,
        filesize: 0,
        id: 'omh-' + layer.layer_id,
        maxzoom,
        minzoom,
        name,
        private: layer.private,
        scheme: 'xyz',
        tilejson: '2.2.0',
        tiles: layer.external_layer_config.tiles,
        webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slugify(name)
      }
      return res.status(200).send(tileJSON)
    } else if (layer.is_external && layer.external_layer_config.type === 'vector') {
      let bounds = [-180, -85.05112877980659, 180, 85.0511287798066]
      if (layer.extent_bbox) bounds = layer.extent_bbox
      const minzoom = layer.external_layer_config.minzoom ? parseInt(layer.external_layer_config.minzoom) : 0
      const maxzoom = layer.external_layer_config.maxzoom ? parseInt(layer.external_layer_config.maxzoom) : 19

      const centerZoom = Math.floor((maxzoom - minzoom) / 2)
      const centerX = Math.floor((bounds[2] - bounds[0]) / 2)
      const centerY = Math.floor((bounds[3] - bounds[1]) / 2)

      const tileJSON = {
        attribution: source,
        bounds,
        center: [centerX, centerY, centerZoom],
        created: layer.last_updated,
        updated: layer.last_updated,
        description,
        legend,
        format: 'pbf',
        id: 'omh-' + layer.layer_id,
        group_id: layer.owned_by_group_id,
        maxzoom,
        minzoom,
        name,
        private: layer.private,
        scheme: 'xyz',
        tilejson: '2.2.0',
        tiles: layer.external_layer_config.tiles,
        webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slugify(name)
      }
      return res.status(200).send(tileJSON)
    } else if (!layer.is_external) {
      let bounds = [-180, -85.05112877980659, 180, 85.0511287798066]
      if (layer.extent_bbox) bounds = layer.extent_bbox
      const minzoom = 0
      const maxzoom = 19

      const centerZoom = Math.floor((maxzoom - minzoom) / 2)
      const centerX = Math.floor((bounds[2] - bounds[0]) / 2)
      const centerY = Math.floor((bounds[3] - bounds[1]) / 2)

      const uri = local.tileServiceUrl + '/tiles/lyr/' + layer.shortid + '/{z}/{x}/{y}.pbf'

      const tileJSON = {
        attribution: source,
        bounds,
        center: [centerX, centerY, centerZoom],
        created: layer.last_updated,
        updated: layer.last_updated,
        description,
        legend,
        format: 'pbf',
        id: 'omh-' + layer.layer_id,
        group_id: layer.owned_by_group_id,
        maxzoom,
        minzoom,
        name,
        private: layer.private,
        scheme: 'xyz',
        tilejson: '2.2.0',
        tiles: [uri],
        data: baseUrl + '/api/layer/' + layer.layer_id + '/export/json/' + slugify(name) + '.geojson',
        webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slugify(name)
      }
      return res.status(200).send(tileJSON)
    } else {
      return res.status(404).send('TileJSON not supported for this layer')
    }
  }

  app.get('/api/layer/:layer_id/tile.json', async (req, res) => {
    try {
      const layer_id = parseInt(req.params.layer_id || '', 10)

      let user_id = -1
      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }

      const layer = await Layer.getLayerByID(layer_id)

      if (layer) {
        if (local.requireLogin) {
          if (manetCheck.check(req) || // screenshot service
            (user_id > 0 && privateLayerCheck(layer.layer_id, user_id)) // logged in and allowed to see this layer
          ) {
            completeLayerTileJSONRequest(req, res, layer)
          } else {
            res.status(404).send()
          }
        } else {
          // only do the private layer check
          if (privateLayerCheck(layer.layer_id, user_id)) {
            completeLayerTileJSONRequest(req, res, layer)
          } else {
            res.status(404).send()
          }
        }
      } else {
        res.status(404).send()
      }
    } catch (err) { apiError(res, 500)(err) }
  })

  app.get('/api/lyr/:shortid/tile.json', async (req, res) => {
    try {
      const shortid = req.params.shortid

      let user_id = -1
      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }

      const isShared = await Layer.isSharedInPublicMap(shortid)
      const layer = await Layer.getLayerByShortID(shortid)
      if (layer) {
        if (local.requireLogin) {
          if (
            isShared || // in public shared map
          manetCheck.check(req) || // screenshot service
          (user_id > 0 && privateLayerCheck(layer.layer_id, user_id)) // logged in and allowed to see this layer
          ) {
            completeLayerTileJSONRequest(req, res, layer)
          } else {
            res.status(404).send()
          }
        } else {
        // only do the private layer check
          if (privateLayerCheck(layer.layer_id, user_id)) {
            completeLayerTileJSONRequest(req, res, layer)
          } else {
            res.status(404).send()
          }
        }
      } else {
        res.status(404).send()
      }
    } catch (err) { apiError(res, 500)(err) }
  })
}
