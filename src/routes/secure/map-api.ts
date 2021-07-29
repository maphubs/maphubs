import Map from '../../models/map'
import Group from '../../models/group'
import ScreenshotUtil from '../../services/screenshot-utils'
import {
  apiError,
  apiDataError,
  notAllowedError
} from '../../services/error-response'
import isAuthenticated from '../../services/auth-check'
import knex from '../../connection'

export default function (app: any): void {
  app.post(
    '/api/map/create',

    isAuthenticated,
    async (req, res) => {
      try {
        const data = req.body

        if (
          data &&
          data.group_id &&
          data.basemap &&
          data.position &&
          data.settings &&
          data.title &&
          data.private !== undefined
        ) {
          if (await Group.allowedToModify(data.group_id, req.user_id)) {
            return knex.transaction(async (trx) => {
              const map_id = await Map.createGroupMap(
                data.layers,
                data.style,
                data.basemap,
                data.position,
                data.title,
                data.settings,
                req.user_id,
                data.group_id,
                data.private,
                trx
              )
              // intentionally not returning here since we don't want to wait for the reload
              ScreenshotUtil.reloadMapThumbnail(map_id)
              ScreenshotUtil.reloadMapImage(map_id)
              return res.status(200).send({
                success: true,
                map_id
              })
            })
          } else {
            throw new Error('Unauthorized')
          }
        } else {
          apiDataError(res)
        }
      } catch (err) {
        apiError(res, 500)(err)
      }
    }
  )
  app.post(
    '/api/map/copy',

    isAuthenticated,
    async (req, res) => {
      try {
        const data = req.body

        if (data && data.map_id && data.group_id) {
          // copy to a group
          if (await Group.allowedToModify(data.group_id, req.user_id)) {
            const map_id = await Map.copyMapToGroup(
              data.map_id,
              data.group_id,
              req.user_id,
              data.title
            )
            // don't wait for screenshot
            ScreenshotUtil.reloadMapThumbnail(map_id)
            ScreenshotUtil.reloadMapImage(map_id)
            return res.status(200).send({
              success: true,
              map_id
            })
          }
        } else {
          apiDataError(res)
        }
      } catch (err) {
        apiError(res, 500)(err)
      }
    }
  )

  app.post(
    '/api/map/public',

    isAuthenticated,
    async (req, res) => {
      try {
        const data = req.body

        if (data && data.map_id && typeof data.isPublic !== 'undefined') {
          if (await Map.allowedToModify(data.map_id, req.user_id)) {
            if (data.isPublic) {
              return res.status(200).send({
                success: true,
                share_id: await Map.addPublicShareID(data.map_id)
              })
            } else {
              await Map.removePublicShareID(data.map_id)
              return res.status(200).send({
                success: true
              })
            }
          } else {
            return notAllowedError(res, 'map')
          }
        } else {
          apiDataError(res)
        }
      } catch (err) {
        apiError(res, 500)(err)
      }
    }
  )
  app.post(
    '/api/map/save',

    isAuthenticated,
    async (req, res) => {
      try {
        const data = req.body

        if (
          data &&
          data.layers &&
          data.style &&
          data.settings &&
          data.basemap &&
          data.position &&
          data.map_id &&
          data.title
        ) {
          if (await Map.allowedToModify(data.map_id, req.user_id)) {
            await Map.updateMap(
              data.map_id,
              data.layers,
              data.style,
              data.basemap,
              data.position,
              data.title,
              data.settings,
              req.user_id
            )
            // don't wait for screenshot
            ScreenshotUtil.reloadMapThumbnail(data.map_id)
            ScreenshotUtil.reloadMapImage(data.map_id)
            return res.status(200).send({
              success: true
            })
          } else {
            return notAllowedError(res, 'map')
          }
        } else {
          apiDataError(res)
        }
      } catch (err) {
        apiError(res, 500)(err)
      }
    }
  )
  app.post(
    '/api/map/delete',

    isAuthenticated,
    async (req, res) => {
      try {
        const data = req.body

        if (data && data.map_id) {
          if (await Map.allowedToModify(data.map_id, req.user_id)) {
            await Map.deleteMap(data.map_id)
            return res.status(200).send({
              success: true
            })
          } else {
            return notAllowedError(res, 'map')
          }
        } else {
          apiDataError(res)
        }
      } catch (err) {
        apiError(res, 500)(err)
      }
    }
  )
}
