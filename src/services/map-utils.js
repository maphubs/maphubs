// @flow
import Locales from '../services/locales'
const Map = require('../models/map')
const nextError = require('./error-response').nextError
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('map-utils')
const local = require('../local')
const pageOptions = require('./page-options-helper')

module.exports = {
  async completeEmbedMapRequest (app: any, req: any, res: any, next: any, map_id: number, isStatic: boolean, canEdit: boolean, interactive: boolean, shared: boolean) {
    let showLogo = true
    if (req.query.hideLogo) {
      showLogo = false
    }

    let showScale = true
    if (req.query.hideScale) {
      showScale = false
    }

    let showInset = true
    if (req.query.hideInset) {
      showInset = false
    }
    try {
      const map = await Map.getMap(map_id)
      const layers = await Map.getMapLayers(map_id, canEdit)

      if (!map) {
        return res.redirect('/notfound?path=' + req.path)
      } else {
        let title = 'Map'
        const geoJSONUrl = req.query.geoJSON
        let markerColor = '#FF0000'
        if (req.query.color) {
          markerColor = '#' + req.query.color
        }
        let overlayName = req.__('Locations')
        if (req.query.overlayName) {
          overlayName = req.query.overlayName
        }

        if (map.title) {
          title = Locales.getLocaleStringObject(req.locale, map.title)
        }
        title += ' - ' + local.productName

        const baseUrl = urlUtil.getBaseUrl()
        let imageUrl
        if (shared && map.share_id) {
          imageUrl = `${baseUrl}/api/map/share/screenshot/${map.share_id}.png`
        } else {
          imageUrl = `${baseUrl}/api/screenshot/map/${map.map_id}.png`
        }
        return app.next.render(req, res, '/embedmap', await pageOptions(req, {
          title,
          props: {
            map,
            layers,
            canEdit,
            isStatic,
            interactive,
            geoJSONUrl,
            markerColor,
            overlayName,
            showLogo,
            showScale,
            insetMap: showInset,
            image: imageUrl,
            publicShare: shared
          },
          hideFeedback: true,
          oembed: 'map',
          twitterCard: {
            title,
            description: req.__('View interactive map on ') + local.productName,
            image: imageUrl,
            imageWidth: 1200,
            imageHeight: 630,
            imageType: 'image/png'
          },
          publicShare: shared
        }))
      }
    } catch (err) { nextError(next)(err) }
  },

  async completeMapRequest (app: any, req: any, res: any, next: any, map_id: number, canEdit: boolean, shared: boolean) {
    debug.log('completeMapRequest')
    try {
      const map = await Map.getMap(map_id)
      const layers = await Map.getMapLayers(map_id, canEdit)

      if (!map) {
        return res.redirect('/notfound?path=' + req.path)
      } else {
        let title = 'Map'
        if (map.title) {
          title = Locales.getLocaleStringObject(req.locale, map.title)
        }
        title += ' - ' + local.productName
        const baseUrl = urlUtil.getBaseUrl()

        let imageUrl
        if (shared && map.share_id) {
          imageUrl = `${baseUrl}/api/map/share/screenshot/${map.share_id}.png`
        } else {
          imageUrl = `${baseUrl}/api/screenshot/map/${map.map_id}.png`
        }

        let showShareButtons = true
        if (local.requireLogin) {
          showShareButtons = false
        }
        // inject into map config
        map.showShareButtons = showShareButtons

        return app.next.render(req, res, '/usermap', await pageOptions(req, {
          title: `${title} - ${local.productName}`,
          props: {map, layers, canEdit, publicShare: shared},
          hideFeedback: true,
          oembed: 'map',
          twitterCard: {
            title,
            description: req.__('View interactive map on ') + local.productName,
            image: imageUrl,
            imageWidth: 1200,
            imageHeight: 630,
            imageType: 'image/png'
          },
          cache: false,
          publicShare: shared
        }))
      }
    } catch (err) { nextError(next)(err) }
  }
}
