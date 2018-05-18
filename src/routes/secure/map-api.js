// @flow
import Locales from '../../services/locales'
const Map = require('../../models/map')
const Group = require('../../models/group')
const ScreenshotUtil = require('../../services/screenshot-utils')
// var debug = require('../../services/debug')('routes/map');
// var log = require('../../services/log');
const apiError = require('../../services/error-response').apiError
const apiDataError = require('../../services/error-response').apiDataError
const notAllowedError = require('../../services/error-response').notAllowedError
const csrfProtection = require('csurf')({cookie: false})
const isAuthenticated = require('../../services/auth-check')

module.exports = function (app: any) {
  app.post('/api/map/create', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.basemap && data.position && data.settings && data.title && data.private !== undefined) {
        let createMap
        if (data.group_id) {
          createMap = Group.allowedToModify(data.group_id, req.user_id)
            .then((allowed) => {
              if (allowed) {
                return Map.createGroupMap(data.layers, data.style, data.basemap, data.position, data.title, data.settings, req.user_id, data.group_id, data.private)
              } else {
                throw new Error('Unauthorized')
              }
            })
        } else {
          createMap = Map.createUserMap(data.layers, data.style, data.basemap, data.position, data.title, data.settings, req.user_id, data.private)
        }
        const map_id = await createMap
        // intentionally not returning here since we don't want to wait for the reload
        ScreenshotUtil.reloadMapThumbnail(map_id)
        ScreenshotUtil.reloadMapImage(map_id)

        return res.status(200).send({success: true, map_id})
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 500)(err) }
  })

  app.post('/api/map/copy', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.map_id) {
        if (await Map.isPrivate(data.map_id)) {
          if (await Map.allowedToModify(data.map_id, req.user_id)) {
            if (data.group_id) {
              // copy to a group
              if (await Group.allowedToModify(data.group_id, req.user_id)) {
                const map_id = await Map.copyMapToGroup(data.map_id, data.group_id, req.user_id, data.title)
                // don't wait for screenshot
                ScreenshotUtil.reloadMapThumbnail(map_id)
                ScreenshotUtil.reloadMapImage(map_id)

                return res.status(200).send({success: true, map_id})
              } else {
                return notAllowedError(res, 'group')
              }
            } else {
              // copy to the requesting user
              const map_id = await Map.copyMapToUser(data.map_id, req.user_id, data.title)

              // don't wait for screenshot
              ScreenshotUtil.reloadMapThumbnail(map_id)
              ScreenshotUtil.reloadMapImage(map_id)

              return res.status(200).send({success: true, map_id})
            }
          } else {
            return notAllowedError(res, 'map')
          }
        } else {
          if (data.group_id) {
            // copy to a group
            if (await Group.allowedToModify(data.group_id, req.user_id)) {
              const map_id = await Map.copyMapToGroup(data.map_id, data.group_id, req.user_id, data.title)
              // don't wait for screenshot
              ScreenshotUtil.reloadMapThumbnail(map_id)
              ScreenshotUtil.reloadMapImage(map_id)

              return res.status(200).send({success: true, map_id})
            } else {
              return notAllowedError(res, 'group')
            }
          } else {
            // copy to the requesting user
            const map_id = await Map.copyMapToUser(data.map_id, req.user_id, data.title)
            // don't wait for screenshot
            ScreenshotUtil.reloadMapThumbnail(map_id)
            ScreenshotUtil.reloadMapImage(map_id)
            return res.status(200).send({success: true, map_id})
          }
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 500)(err) }
  })

  /* not used?

  app.post('/api/map/privacy', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    var data = req.body;
    if(data && data.map_id && typeof data.isPrivate !== 'undefined'){
      Map.allowedToModify(data.map_id, user_id)
      .then((allowed) => {
        if(allowed){
          return Map.setPrivate(data.map_id, data.isPrivate, data.user_id)
          .then(() => {
            return res.status(200).send({success: true});
          });
        }else{
          return notAllowedError(res, 'map');
        }
      }).catch(apiError(res, 200));
    }else{
      apiDataError(res);
    }
  });
  */

  app.post('/api/map/public', csrfProtection, isAuthenticated, async (req, res) => {
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
            return res.status(200).send({success: true})
          }
        } else {
          return notAllowedError(res, 'map')
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 500)(err) }
  })

  app.post('/api/map/save', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.layers && data.style && data.settings && data.basemap && data.position && data.map_id && data.title) {
        if (await Map.allowedToModify(data.map_id, req.user_id)) {
          await Map.updateMap(data.map_id, data.layers, data.style, data.basemap, data.position, data.title, data.settings, req.user_id)
          // don't wait for screenshot
          ScreenshotUtil.reloadMapThumbnail(data.map_id)
          ScreenshotUtil.reloadMapImage(data.map_id)
          return res.status(200).send({success: true})
        } else {
          return notAllowedError(res, 'map')
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 500)(err) }
  })

  app.post('/api/map/delete', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.map_id) {
        if (await Map.allowedToModify(data.map_id, req.user_id)) {
          await Map.deleteMap(data.map_id)
          return res.status(200).send({success: true})
        } else {
          return notAllowedError(res, 'map')
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 500)(err) }
  })

  app.get('/api/maps/search/suggestions', (req, res) => {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc')
      return
    }
    const q = req.query.q
    Map.getSearchSuggestions(q)
      .then((result) => {
        const suggestions = []
        result.forEach((map) => {
          const title = Locales.getLocaleStringObject(req.locale, map.title)
          suggestions.push({key: map.map_id, value: title})
        })
        return res.send({suggestions})
      }).catch(apiError(res, 500))
  })

  app.get('/api/maps/search', (req, res) => {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc')
      return
    }
    Map.getSearchResults(req.query.q)
      .then((result) => {
        return res.status(200).send({maps: result})
      }).catch(apiError(res, 500))
  })
}
