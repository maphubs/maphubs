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

  app.get(
    '/createlayer',
    csrfProtection,
    login.ensureLoggedIn(),
    (req, res, next) => {
      const user_id = req.session.user.maphubsUser.id
      knex
        .transaction(async (trx) => {
          const layer_id = await Layer.createLayer(user_id, trx)
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
              canEdit: await Layer.allowedToModify(layer_id, user_id)
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
}
