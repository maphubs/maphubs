import Map from '../../models/map'
import Stats from '../../models/stats'
import MapUtils from '../../services/map-utils'
import ScreenshotUtils from '../../services/screenshot-utils'
import {
  nextError,
  apiError,
  apiDataError
} from '../../services/error-response'

export default function (app: any): void {
  const recordMapView = function (
    session: Record<string, any>,
    map_id: number,
    user_id: number,
    next: any
  ) {
    if (!session.mapviews) {
      session.mapviews = {}
    }

    if (!session.mapviews[map_id]) {
      session.mapviews[map_id] = 1
      Stats.addMapView(map_id, user_id).catch(nextError(next))
    } else {
      const views = session.mapviews[map_id]
      session.mapviews[map_id] = views + 1
    }

    session.views = (session.views || 0) + 1
  }

  app.get('/map/share/:share_id', async (req, res, next) => {
    const share_id = req.params.share_id
    let user_id = -1

    if (req.session.user) {
      user_id = req.session.user.maphubsUser.id
    }

    try {
      const map = await Map.getMapByShareId(share_id)

      if (map) {
        const map_id = map.map_id
        recordMapView(req.session, map_id, user_id, next)

        if (
          !req.isAuthenticated ||
          !req.isAuthenticated() ||
          !req.session ||
          !req.session.user
        ) {
          return MapUtils.completeMapRequest(
            app,
            req,
            res,
            next,
            map_id,
            false,
            true
          )
        } else {
          const allowed = await Map.allowedToModify(map_id, user_id)
          return MapUtils.completeMapRequest(
            app,
            req,
            res,
            next,
            map_id,
            allowed,
            true
          )
        }
      } else {
        return res.redirect('/notfound?path=' + req.path)
      }
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/api/map/share/screenshot/:share_id.png', async (req, res) => {
    try {
      const map = await Map.getMapByShareId(req.params.share_id)

      return map
        ? ScreenshotUtils.returnImage(
            await ScreenshotUtils.getMapImage(map.map_id),
            'image/png',
            req,
            res
          )
        : res.status(404).send()
    } catch (err) {
      apiError(res, 500)(err)
    }
  })
  app.get('/map/public-embed/:share_id', async (req, res, next) => {
    const share_id = req.params.share_id

    if (!share_id) {
      apiDataError(res)
    }

    let user_id = -1

    if (req.session.user) {
      user_id = req.session.user.maphubsUser.id
    }

    try {
      const map = await Map.getMapByShareId(share_id)

      if (map) {
        const map_id = map.map_id
        recordMapView(req.session, map_id, user_id, next)

        if (
          !req.isAuthenticated ||
          !req.isAuthenticated() ||
          !req.session ||
          !req.session.user
        ) {
          return MapUtils.completeEmbedMapRequest(
            app,
            req,
            res,
            next,
            map_id,
            false,
            false,
            false,
            true
          )
        } else {
          const allowed = await Map.allowedToModify(map_id, user_id)
          return MapUtils.completeEmbedMapRequest(
            app,
            req,
            res,
            next,
            map_id,
            false,
            allowed,
            false,
            true
          )
        }
      } else {
        return res.redirect('/notfound?path=' + req.path)
      }
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/map/public-embed/:share_id/static', async (req, res, next) => {
    const share_id = req.params.share_id

    if (!share_id) {
      apiDataError(res)
    }

    let user_id = -1

    if (req.session.user) {
      user_id = req.session.user.maphubsUser.id
    }

    try {
      const map = await Map.getMapByShareId(share_id)

      if (map) {
        const map_id = map.map_id
        recordMapView(req.session, map_id, user_id, next)

        if (
          !req.isAuthenticated ||
          !req.isAuthenticated() ||
          !req.session ||
          !req.session.user
        ) {
          return MapUtils.completeEmbedMapRequest(
            app,
            req,
            res,
            next,
            map_id,
            true,
            false,
            false,
            true
          )
        } else {
          const allowed = await Map.allowedToModify(map_id, user_id)
          return MapUtils.completeEmbedMapRequest(
            app,
            req,
            res,
            next,
            map_id,
            true,
            allowed,
            false,
            true
          )
        }
      } else {
        return res.redirect('/notfound?path=' + req.path)
      }
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/map/public-embed/:share_id/interactive', async (req, res, next) => {
    const share_id = req.params.share_id

    if (!share_id) {
      apiDataError(res)
    }

    let user_id = -1

    if (req.session.user) {
      user_id = req.session.user.maphubsUser.id
    }

    try {
      const map = await Map.getMapByShareId(share_id)

      if (map) {
        const map_id = map.map_id
        recordMapView(req.session, map_id, user_id, next)

        if (
          !req.isAuthenticated ||
          !req.isAuthenticated() ||
          !req.session ||
          !req.session.user
        ) {
          return MapUtils.completeEmbedMapRequest(
            app,
            req,
            res,
            next,
            map_id,
            true,
            false,
            true,
            true
          )
        } else {
          const allowed = await Map.allowedToModify(map_id, user_id)
          return MapUtils.completeEmbedMapRequest(
            app,
            req,
            res,
            next,
            map_id,
            true,
            allowed,
            true,
            true
          )
        }
      } else {
        return res.redirect('/notfound?path=' + req.path)
      }
    } catch (err) {
      nextError(next)(err)
    }
  })
}
