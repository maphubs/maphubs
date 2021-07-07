import Locales from '../../services/locales'
import Layer from '../../models/layer'
import Group from '../../models/group'
import User from '../../models/user'
import Stats from '../../models/stats'
import login from 'connect-ensure-login'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import { nextError } from '../../services/error-response'
import csurf from 'csurf'
import knex from '../../connection'
import pageOptions from '../../services/page-options-helper'
import local from '../../local'

const csrfProtection = csurf({
  cookie: false
})

export default function (app: any) {
  // Views
  app.get('/layers', csrfProtection, async (req, res, next) => {
    try {
      return app.next.render(
        req,
        res,
        '/layers',
        await pageOptions(req, {
          title: req.__('Layers') + ' - ' + local.productName,
          props: {
            featuredLayers: await Layer.getFeaturedLayers(),
            recentLayers: await Layer.getRecentLayers(),
            popularLayers: await Layer.getPopularLayers()
          }
        })
      )
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/layers/all', csrfProtection, async (req, res, next) => {
    try {
      const locale = req.locale ? req.locale : 'en'
      const groups = await Group.getAllGroups().orderByRaw(
        `lower((omh.groups.name -> '${locale}')::text)`
      )
      return app.next.render(
        req,
        res,
        '/alllayers',
        await pageOptions(req, {
          title: req.__('Layers') + ' - ' + local.productName,
          props: {
            layers: await Layer.getAllLayers(false),
            groups
          }
        })
      )
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get(
    '/createlayer',
    csrfProtection,
    login.ensureLoggedIn(),
    (req, res, next) => {
      const user_id = req.session.user.maphubsUser.id
      knex
        .transaction(async (trx) => {
          let layer_id = await Layer.createLayer(user_id, trx)
          layer_id = Number.parseInt(layer_id, 10)
          return app.next.render(
            req,
            res,
            '/createlayer',
            await pageOptions(req, {
              title: req.__('Create Layer') + ' - ' + local.productName,
              props: {
                groups: await Group.getGroupsForUser(user_id, trx),
                layer: await Layer.getLayerByID(layer_id, trx)
              }
            })
          )
        })
        .catch(nextError(next))
    }
  )
  app.get('/layer/info/:layer_id/*', csrfProtection, async (req, res, next) => {
    try {
      const layer_id = Number.parseInt(req.params.layer_id || '', 10)
      const baseUrl = urlUtil.getBaseUrl()
      let user_id = -1

      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }

      if (!req.session.layerviews) {
        req.session.layerviews = {}
      }

      if (!req.session.layerviews[layer_id]) {
        req.session.layerviews[layer_id] = 1
        await Stats.addLayerView(layer_id, user_id).catch(nextError(next))
      } else {
        const views = req.session.layerviews[layer_id]
        req.session.layerviews[layer_id] = views + 1
      }

      req.session.views = (req.session.views || 0) + 1
      const layer = await Layer.getLayerByID(layer_id)

      if (layer) {
        const name = Locales.getLocaleStringObject(req.locale, layer.name)
        const description = Locales.getLocaleStringObject(
          req.locale,
          layer.description
        )
        const notesObj = await Layer.getLayerNotes(layer_id)
        let notes

        if (notesObj && notesObj.notes) {
          notes = notesObj.notes
        }

        return app.next.render(
          req,
          res,
          '/layerinfo',
          await pageOptions(req, {
            title: name + ' - ' + local.productName,
            description,
            props: {
              layer,
              notes,
              stats: await Stats.getLayerStats(layer_id),
              canEdit: await Layer.allowedToModify(layer_id, user_id),
              createdByUser: await User.getUser(layer.created_by_user_id),
              updatedByUser: await User.getUser(layer.updated_by_user_id)
            },
            talkComments: true,
            twitterCard: {
              title: name,
              description,
              image:
                baseUrl +
                '/api/screenshot/layer/image/' +
                layer.layer_id +
                '.png',
              imageWidth: 1200,
              imageHeight: 630,
              imageType: 'image/png'
            }
          })
        )
      } else {
        return app.next.render(
          req,
          res,
          '/error',
          await pageOptions(req, {
            title: req.__('Not Found'),
            props: {
              title: req.__('Not Found'),
              error: req.__('The page you requested was not found'),
              url: req.url
            }
          })
        )
      }
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/lyr/:layerid', csrfProtection, (req, res) => {
    const layerid = req.params.layerid
    const baseUrl = urlUtil.getBaseUrl()
    res.redirect(baseUrl + '/layer/info/' + layerid + '/')
  })
  app.get('/layer/map/:layer_id/*', csrfProtection, async (req, res, next) => {
    try {
      const layer_id = Number.parseInt(req.params.layer_id || '', 10)
      const baseUrl = urlUtil.getBaseUrl()
      let user_id = -1

      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }

      if (!req.session.layerviews) {
        req.session.layerviews = {}
      }

      if (!req.session.layerviews[layer_id]) {
        req.session.layerviews[layer_id] = 1
        await Stats.addLayerView(layer_id, user_id)
      } else {
        const views = req.session.layerviews[layer_id]
        req.session.layerviews[layer_id] = views + 1
      }

      req.session.views = (req.session.views || 0) + 1
      const layer = await Layer.getLayerByID(layer_id)

      if (layer) {
        const name = Locales.getLocaleStringObject(req.locale, layer.name)
        const description = Locales.getLocaleStringObject(
          req.locale,
          layer.description
        )
        return app.next.render(
          req,
          res,
          '/layermap',
          await pageOptions(req, {
            title: name + ' - ' + local.productName,
            description,
            props: {
              layer,
              canEdit: await Layer.allowedToModify(layer_id, user_id)
            },
            twitterCard: {
              title: name,
              description,
              image:
                baseUrl +
                '/api/screenshot/layer/image/' +
                layer.layer_id +
                '.png',
              imageWidth: 1200,
              imageHeight: 630,
              imageType: 'image/png'
            }
          })
        )
      } else {
        return app.next.render(
          req,
          res,
          '/error',
          await pageOptions(req, {
            title: req.__('Not Found'),
            props: {
              title: req.__('Not Found'),
              error: req.__('The page you requested was not found'),
              url: req.url
            }
          })
        )
      }
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get(
    '/layer/adddata/:id',
    csrfProtection,
    login.ensureLoggedIn(),
    async (req, res, next) => {
      try {
        const layer_id = Number.parseInt(req.params.id || '', 10)
        const user_id = req.session.user.maphubsUser.id
        const allowed = await Layer.allowedToModify(layer_id, user_id)
        const layer = await Layer.getLayerByID(layer_id)

        if (layer && (allowed || layer.allowPublicSubmission)) {
          // placeholder for public submission flag on layers
          return layer.data_type === 'point' && !layer.is_external
            ? app.next.render(
                req,
                res,
                '/addphotopoint',
                await pageOptions(req, {
                  title:
                    Locales.getLocaleStringObject(req.locale, layer.name) +
                    ' - ' +
                    local.productName,
                  props: {
                    layer
                  }
                })
              )
            : res
                .status(400)
                .send('Bad Request: Feature not support for this layer')
        } else {
          return res.redirect('/unauthorized')
        }
      } catch (err) {
        nextError(next)(err)
      }
    }
  )
  app.get(
    '/layer/admin/:id/*',
    csrfProtection,
    login.ensureLoggedIn(),
    async (req, res, next) => {
      try {
        const user_id = req.session.user.maphubsUser.id
        const layer_id = Number.parseInt(req.params.id || '', 10)
        // confirm that this user is allowed to administer this layeradmin
        const allowed = await Layer.allowedToModify(layer_id, user_id)

        if (allowed) {
          const layer = await Layer.getLayerByID(layer_id)

          return layer
            ? app.next.render(
                req,
                res,
                '/layeradmin',
                await pageOptions(req, {
                  title:
                    Locales.getLocaleStringObject(req.locale, layer.name) +
                    ' - ' +
                    local.productName,
                  props: {
                    layer,
                    groups: await Group.getGroupsForUser(user_id)
                  }
                })
              )
            : res.redirect('/unauthorized')
        } else {
          return res.redirect('/unauthorized')
        }
      } catch (err) {
        nextError(next)(err)
      }
    }
  )
}
