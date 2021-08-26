import Locales from '../../services/locales'
import Map from '../../models/map'
import Layer from '../../models/layer'
import Group from '../../models/group'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import MapUtils from '../../services/map-utils'
import { nextError, apiDataError } from '../../services/error-response'
import pageOptions from '../../services/page-options-helper'

const debug = DebugService('routes/map')

export default function (app: any) {
  app.get('/map/new', async (req, res, next) => {
    try {
      if (
        !req.isAuthenticated ||
        !req.isAuthenticated() ||
        !req.session ||
        !req.session.user
      ) {
        const popularLayers = await Layer.getPopularLayers()
        return app.next.render(
          req,
          res,
          '/map',
          await pageOptions(req, {
            title: 'New Map ',
            props: {
              popularLayers,
              groups: await Group.getAllGroups()
            }
          })
        )
      } else {
        // get user id
        const user_id = req.session.user.maphubsUser.id

        const popularLayers = await Layer.getPopularLayers()
        await Layer.attachPermissionsToLayers(popularLayers, user_id)
        const myLayers = await Layer.getUserLayers(user_id, 50)
        await Layer.attachPermissionsToLayers(myLayers, user_id)
        const editLayerId = req.query.editlayer
        let editLayer

        if (editLayerId) {
          const allowed = await Layer.allowedToModify(editLayerId, user_id)

          if (allowed) {
            editLayer = await Layer.getLayerByID(editLayerId)

            if (editLayer) {
              editLayer.canEdit = true
            }
          }
        }

        return app.next.render(
          req,
          res,
          '/map',
          await pageOptions(req, {
            title: req.__('New Map'),
            props: {
              popularLayers,
              myLayers,
              editLayer,
              groups: await Group.getAllGroups()
            }
          })
        )
      }
    } catch (err) {
      nextError(next)(err)
    }
  })

  app.get('/map/view/:map_id/*', (req, res, next) => {
    const map_id = req.params.map_id

    if (!map_id) {
      apiDataError(res)
    }

    let user_id = -1

    if (req.session.user) {
      user_id = req.session.user.maphubsUser.id
    }

    if (
      !req.isAuthenticated ||
      !req.isAuthenticated() ||
      !req.session ||
      !req.session.user
    ) {
      MapUtils.completeMapRequest(app, req, res, next, map_id, false, false)
    } else {
      // get user id
      Map.allowedToModify(map_id, user_id)
        .then((allowed) => {
          return MapUtils.completeMapRequest(
            app,
            req,
            res,
            next,
            map_id,
            allowed,
            false
          )
        })
        .catch(nextError(next))
    }
  })

  app.get('/map/edit/:map_id', async (req, res, next) => {
    try {
      const map_id = req.params.map_id

      if (!map_id) {
        apiDataError(res)
      }

      let user_id = -1

      if (req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }

      if (
        !req.isAuthenticated ||
        !req.isAuthenticated() ||
        !req.session ||
        !req.session.user
      ) {
        // need to be logged in
        res.redirect('/unauthorized')
      } else {
        // get user id
        const allowed = await Map.allowedToModify(map_id, user_id)

        if (allowed) {
          const map = await Map.getMap(map_id)
          const layers = await Map.getMapLayers(map_id, true).then((layers) => {
            return Layer.attachPermissionsToLayers(layers, user_id)
          })
          const popularLayers = await Layer.getPopularLayers().then(
            (layers) => {
              return Layer.attachPermissionsToLayers(layers, user_id)
            }
          )
          const myLayers = await Layer.getUserLayers(user_id, 50, true).then(
            (layers) => {
              return Layer.attachPermissionsToLayers(layers, user_id)
            }
          )
          let title = 'Map'

          if (map && map.title) {
            title = Locales.getLocaleStringObject(req.locale, map.title)
          }

          return app.next.render(
            req,
            res,
            '/mapedit',
            await pageOptions(req, {
              title: title + ' - ' + process.env.NEXT_PUBLIC_PRODUCT_NAME,
              props: {
                map,
                layers,
                popularLayers,
                myLayers,
                groups: await Group.getAllGroups()
              }
            })
          )
        } else {
          return res.redirect('/unauthorized')
        }
      }
    } catch (err) {
      nextError(next)(err)
    }
  })
}
