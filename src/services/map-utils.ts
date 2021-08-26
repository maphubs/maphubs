import Locales from '../services/locales'
import Map from '../models/map'
import { nextError } from './error-response'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import pageOptions from './page-options-helper'

const debug = DebugService('map-utils')

export default {
  async completeEmbedMapRequest(
    app: any,
    req: any,
    res: any,
    next: any,
    map_id: number,
    isStatic: boolean,
    canEdit: boolean,
    interactive: boolean,
    shared: boolean
  ): Promise<any> {
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

        title += ' - ' + process.env.NEXT_PUBLIC_PRODUCT_NAME
        const baseUrl = urlUtil.getBaseUrl()
        const imageUrl =
          shared && map.share_id
            ? `${baseUrl}/api/map/share/screenshot/${map.share_id}.png`
            : `${baseUrl}/api/screenshot/map/${map.map_id}.png`

        return app.next.render(
          req,
          res,
          '/embedmap',
          await pageOptions(req, {
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
              description:
                req.__('View interactive map on ') +
                process.env.NEXT_PUBLIC_PRODUCT_NAME,
              image: imageUrl,
              imageWidth: 1200,
              imageHeight: 630,
              imageType: 'image/png'
            },
            publicShare: shared
          })
        )
      }
    } catch (err) {
      nextError(next)(err)
    }
  },

  async completeMapRequest(
    app: any,
    req: any,
    res: any,
    next: any,
    map_id: number,
    canEdit: boolean,
    shared: boolean
  ): Promise<any> {
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

        title += ' - ' + process.env.NEXT_PUBLIC_PRODUCT_NAME
        const baseUrl = urlUtil.getBaseUrl()

        const imageUrl =
          shared && map.share_id
            ? `${baseUrl}/api/map/share/screenshot/${map.share_id}.png`
            : `${baseUrl}/api/screenshot/map/${map.map_id}.png`

        let showShareButtons = true

        if (process.env.NEXT_PUBLIC_REQUIRE_LOGIN === 'true') {
          showShareButtons = false
        }

        // inject into map config
        map.showShareButtons = showShareButtons
        return app.next.render(
          req,
          res,
          '/usermap',
          await pageOptions(req, {
            title: `${title} - ${process.env.NEXT_PUBLIC_PRODUCT_NAME}`,
            props: {
              map,
              layers,
              canEdit,
              publicShare: shared
            },
            oembed: 'map',
            twitterCard: {
              title,
              description:
                req.__('View interactive map on ') +
                process.env.NEXT_PUBLIC_PRODUCT_NAME,
              image: imageUrl,
              imageWidth: 1200,
              imageHeight: 630,
              imageType: 'image/png'
            },
            cache: false,
            publicShare: shared
          })
        )
      }
    } catch (err) {
      nextError(next)(err)
    }
  }
}
