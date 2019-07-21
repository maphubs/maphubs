// @flow
const Feature = require('../../models/feature')
const Layer = require('../../models/layer')
const LayerData = require('../../models/layer-data')
const PhotoAttachment = require('../../models/photo-attachment')
const SearchIndex = require('../../models/search-index')
const knex = require('../../connection')
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')
const imageUtils = require('../../services/image-utils')
const layerViews = require('../../services/layer-views')
// var debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('routes/features');
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')
const apiError = require('../../services/error-response').apiError
const nextError = require('../../services/error-response').nextError
const apiDataError = require('../../services/error-response').apiDataError
const notAllowedError = require('../../services/error-response').notAllowedError
const csrfProtection = require('csurf')({cookie: false})
const privateLayerCheck = require('../../services/private-layer-check')
const isAuthenticated = require('../../services/auth-check')
const pageOptions = require('../../services/page-options-helper')
const local = require('../../local')

module.exports = function (app: any) {
  app.get('/feature/:layer_id/:id/*', csrfProtection, privateLayerCheck.middlewareView, async (req, res, next) => {
    const id = req.params.id
    const layer_id = parseInt(req.params.layer_id || '', 10)

    let mhid
    if (id.includes(':')) {
      mhid = id
    } else {
      mhid = `${layer_id}:${id}`
    }

    let user_id: number = -1
    if (req.session.user) {
      user_id = req.session.user.maphubsUser.id
    }

    if (mhid && layer_id) {
      try {
        const layer = await Layer.getLayerByID(layer_id)
        if (layer) {
          const geoJSON = await Feature.getGeoJSON(mhid, layer.layer_id)
          const notes = await Feature.getFeatureNotes(mhid, layer.layer_id)
          if (geoJSON) {
            const photos = await PhotoAttachment.getPhotoIdsForFeature(layer_id, mhid)
            let photo
            if (photos && Array.isArray(photos)) {
              photo = photos[0]
            }

            let featureName = 'Feature'
            if (geoJSON.features.length > 0 && geoJSON.features[0].properties) {
              const geoJSONProps = geoJSON.features[0].properties
              if (geoJSONProps.name) {
                featureName = geoJSONProps.name
              }
              geoJSONProps.layer_id = layer_id
              geoJSONProps.mhid = mhid
            }

            const feature = {
              type: geoJSON.type,
              features: geoJSON.features,
              layer_id: layer.layer_id,
              bbox: geoJSON.bbox,
              mhid
            }

            if (!req.isAuthenticated || !req.isAuthenticated()) {
              return app.next.render(req, res, '/featureinfo', await pageOptions(req, {
                title: featureName + ' - ' + local.productName,
                fontawesome: true,
                talkComments: true,
                hideFeedback: true,
                props: {feature, notes, photo, layer, canEdit: false},
                cache: false
              }))
            } else {
              const allowed = await Layer.allowedToModify(layer_id, user_id)
              if (allowed) {
                return app.next.render(req, res, '/featureinfo', await pageOptions(req, {
                  title: featureName + ' - ' + local.productName,
                  fontawesome: true,
                  talkComments: true,
                  hideFeedback: true,
                  props: {feature, notes, photo, layer, canEdit: true}
                }))
              } else {
                return app.next.render(req, res, '/featureinfo', await pageOptions(req, {
                  title: featureName + ' - ' + local.productName,
                  fontawesome: true,
                  talkComments: true,
                  props: {feature, notes, photo, layer, canEdit: false}
                }))
              }
            }
          } else {
            return res.redirect('/notfound?path=' + req.path)
          }
        } else {
          return res.redirect('/notfound?path=' + req.path)
        }
      } catch (err) { nextError(next)(err) }
    } else {
      next(new Error('Missing Required Data'))
    }
  })

  app.get('/api/feature/json/:layer_id/:id/*', privateLayerCheck.middleware, async (req, res) => {
    const id = req.params.id
    const layer_id = parseInt(req.params.layer_id || '', 10)

    let mhid
    if (id.includes(':')) {
      mhid = id
    } else {
      mhid = `${layer_id}:${id}`
    }

    if (mhid && layer_id) {
      try {
        const geoJSON = await Feature.getGeoJSON(mhid, layer_id)
        const resultStr = JSON.stringify(geoJSON)
        const hash = require('crypto').createHash('md5').update(resultStr).digest('hex')
        const match = req.get('If-None-Match')
        /* eslint-disable security/detect-possible-timing-attacks */
        if (hash === match) {
          res.status(304).send()
        } else {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'ETag': hash
          })
          res.end(resultStr)
        }
        return
      } catch (err) { apiError(res, 500)(err) }
    } else {
      apiDataError(res)
    }
  })

  app.get('/api/feature/gpx/:layer_id/:id/*', privateLayerCheck.middleware, async (req, res, next) => {
    const id = req.params.id
    const layer_id = parseInt(req.params.layer_id || '', 10)

    const mhid = `${layer_id}:${id}`

    if (mhid && layer_id) {
      try {
        const layer = await Layer.getLayerByID(layer_id)
        if (layer) {
          const geoJSON = await Feature.getGeoJSON(mhid, layer.layer_id)

          geoJSON.features[0].geometry.type = 'LineString'
          const coordinates = geoJSON.features[0].geometry.coordinates[0][0]
          log.info(coordinates)
          const resultStr = JSON.stringify(geoJSON)
          log.info(resultStr)
          const hash = require('crypto').createHash('md5').update(resultStr).digest('hex')
          const match = req.get('If-None-Match')
          if (hash === match) {
            return res.status(304).send()
          } else {
            res.writeHead(200, {
              'Content-Type': 'application/gpx+xml',
              'ETag': hash
            })

            let gpx = `
            <gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="MapHubs">
              <metadata>
                <link href="https://maphubs.com">
                  <text>MapHubs</text>
                </link>
              </metadata>
              <trk>
                <name>Feature</name>
                <trkseg>
                `
            coordinates.forEach((coord) => {
              gpx += ` <trkpt lon="${coord[0]}" lat="${coord[1]}"></trkpt>`
            })

            gpx += `
                </trkseg>
              </trk>
              </gpx>`

            return res.end(gpx)
          }
        } else {
          res.redirect('/notfound?path=' + req.path)
        }
      } catch (err) { nextError(next)(err) }
    } else {
      next(new Error('Missing Required Data'))
    }
  })

  app.get('/feature/photo/:photo_id.jpg', async (req, res) => {
    const photo_id = req.params.photo_id
    let user_id = -1
    if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
      user_id = req.session.user.maphubsUser.id
    }
    try {
      const layer = await Layer.getLayerForPhotoAttachment(photo_id)
      const allowed = await privateLayerCheck.check(layer.layer_id, user_id)

      if (allowed) {
        const result = await PhotoAttachment.getPhotoAttachment(photo_id)
        if (result) {
          return imageUtils.processImage(result.data, req, res)
        } else {
          res.status(404).send('Not Found')
        }
      } else {
        log.warn('Unauthorized attempt to access layer: ' + layer.layer_id)
        throw new Error('Unauthorized')
      }
    } catch (err) { apiError(res, 404)(err) }
  })

  app.post('/api/feature/notes/save', csrfProtection, isAuthenticated, async (req, res) => {
    const data = req.body
    if (data && data.layer_id && data.mhid && data.notes) {
      try {
        const allowed = await Layer.allowedToModify(data.layer_id, req.user_id)
        if (allowed) {
          return knex.transaction(async (trx) => {
            await Feature.saveFeatureNote(data.mhid, data.layer_id, req.user_id, data.notes, trx)
            await SearchIndex.updateFeature(data.layer_id, data.mhid, true, trx)
            return res.send({success: true})
          })
        } else {
          return notAllowedError(res, 'layer')
        }
      } catch (err) { apiError(res, 500)(err) }
    } else {
      apiDataError(res)
    }
  })

  app.post('/api/feature/photo/add', csrfProtection, isAuthenticated, (req, res) => {
    const data = req.body
    if (data && data.layer_id && data.mhid && data.image && data.info) {
      Layer.allowedToModify(data.layer_id, req.user_id)
        .then((allowed) => {
          if (allowed) {
            return knex.transaction(async (trx) => {
            // set will replace existing photo
              const photo_id = await PhotoAttachment.setPhotoAttachment(data.layer_id, data.mhid, data.image, data.info, req.alloweduser_id, trx)

              // add a tag to the feature and update the layer
              const layer = await Layer.getLayerByID(data.layer_id, trx)
              if (layer) {
                const baseUrl = urlUtil.getBaseUrl()
                const photo_url = baseUrl + '/feature/photo/' + photo_id + '.jpg'
                await LayerData.setStringTag(layer.layer_id, data.mhid, 'photo_url', photo_url, trx)
                const presets = await PhotoAttachment.addPhotoUrlPreset(layer, req.user_id, trx)
                await layerViews.replaceViews(data.layer_id, presets, trx)
                await Layer.setUpdated(data.layer_id, req.user_id, trx)

                return res.send({success: true, photo_id, photo_url})
              } else {
                return res.send({success: false, error: 'layer not found'})
              }
            }).catch(apiError(res, 500))
          } else {
            return notAllowedError(res, 'layer')
          }
        }).catch(apiError(res, 500))
    } else {
      apiDataError(res)
    }
  })

  app.post('/api/feature/photo/delete', csrfProtection, isAuthenticated, async (req, res) => {
    const data = req.body
    if (data && data.layer_id && data.mhid && data.photo_id) {
      Layer.allowedToModify(data.layer_id, req.user_id)
        .then((allowed) => {
          if (allowed) {
            return knex.transaction(async (trx) => {
            // set will replace existing photo
              await PhotoAttachment.deletePhotoAttachment(data.layer_id, data.mhid, data.photo_id, trx)
              const layer = await Layer.getLayerByID(data.layer_id, trx)
              if (layer) {
                // remove the photo URL from feature
                await LayerData.setStringTag(layer.layer_id, data.mhid, 'photo_url', null, trx)
                await layerViews.replaceViews(data.layer_id, layer.presets, trx)
                await Layer.setUpdated(data.layer_id, req.user_id, trx)
                return res.send({success: true})
              } else {
                return res.send({success: false, error: 'layer not found'})
              }
            }).catch(apiError(res, 500))
          } else {
            return notAllowedError(res, 'layer')
          }
        }).catch(apiError(res, 500))
    } else {
      apiDataError(res)
    }
  })
}
