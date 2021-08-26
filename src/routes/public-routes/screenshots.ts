import Locales from '../../services/locales'

import Layer from '../../models/layer'

import Map from '../../models/map'

import { nextError } from '../../services/error-response'

import { manetMiddleware } from '../../services/manet-check'

import pageOptions from '../../services/page-options-helper'

export default function (app: any) {
  // create a map view that we will use to screenshot the layer
  app.get(
    '/api/layer/:layer_id/static/render/',
    manetMiddleware,
    (req, res, next) => {
      const layer_id = Number.parseInt(req.params.layer_id || '', 10)

      if (!layer_id) {
        return res.status(404).send()
      }

      Layer.getLayerByID(layer_id)
        .then(async (layer) => {
          if (layer) {
            const name = Locales.getLocaleStringObject(req.locale, layer.name)
            const title = name + ' - ' + process.env.NEXT_PUBLIC_PRODUCT_NAME
            return app.next.render(
              req,
              res,
              '/staticmap',
              await pageOptions(req, {
                title,
                hideFeedback: true,
                disableGoogleAnalytics: true,
                props: {
                  name,
                  layers: [layer],
                  position: layer.preview_position,
                  basemap: 'default',
                  style: layer.style,
                  showLegend: false,
                  insetMap: false,
                  showLogo: false
                }
              })
            )
          } else {
            return res.status(404).send()
          }
        })
        .catch(nextError(next))
    }
  )

  const completeMapStaticRender = async function (req, res, next, map_id) {
    let showLegend = true

    if (req.query.hideLegend) {
      showLegend = false
    }

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

    let showToolbar = false

    if (req.query.showToolbar) {
      showToolbar = true
    }

    try {
      const map = await Map.getMap(map_id)

      if (!map) {
        return res.status(404).send()
      } else {
        const layers = await Map.getMapLayers(map_id, true)

        let title = req.__('Map')

        if (map.title) {
          title = Locales.getLocaleStringObject(req.locale, map.title)
        }

        return app.next.render(
          req,
          res,
          '/staticmap',
          await pageOptions(req, {
            title: title + ' - ' + process.env.NEXT_PUBLIC_PRODUCT_NAME,
            hideFeedback: true,
            disableGoogleAnalytics: true,
            props: {
              name: title,
              layers,
              position: map.position,
              basemap: map.basemap,
              style: map.style,
              settings: map.settings,
              showLegend,
              showLogo,
              showScale,
              showToolbar,
              insetMap: showInset
            }
          })
        )
      }
    } catch (err) {
      nextError(next)(err)
    }
  }

  app.get(
    '/api/map/:mapid/static/render/',
    manetMiddleware,
    async (req, res, next) => {
      const map_id = Number.parseInt(req.params.mapid || '', 10)

      if (map_id) {
        await completeMapStaticRender(req, res, next, map_id)
      } else {
        return res.status(404).send()
      }
    }
  )
  app.get(
    '/api/map/:mapid/static/render/thumbnail',
    manetMiddleware,
    async (req, res, next) => {
      try {
        const map_id = Number.parseInt(req.params.mapid || '', 10)

        if (!map_id) {
          return res.status(404).send()
        }

        const map = await Map.getMap(map_id)

        if (!map) {
          return res.status(404).send()
        } else {
          const layers = await Map.getMapLayers(map_id, true)
          let title = 'Map'

          if (map.title) {
            title = Locales.getLocaleStringObject(req.locale, map.title)
          }

          return app.next.render(
            req,
            res,
            '/staticmap',
            await pageOptions(req, {
              title: title + ' - ' + process.env.NEXT_PUBLIC_PRODUCT_NAME,
              disableGoogleAnalytics: true,
              props: {
                name: title,
                layers,
                position: map.position,
                basemap: map.basemap,
                style: map.style,
                showLegend: false,
                insetMap: false,
                showLogo: false,
                showScale: false
              }
            })
          )
        }
      } catch (err) {
        nextError(next)(err)
      }
    }
  )
}
