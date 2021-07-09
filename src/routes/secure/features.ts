import Feature from '../../models/feature'
import Layer from '../../models/layer'
import LayerData from '../../models/layer-data'
import PhotoAttachment from '../../models/photo-attachment'
import knex from '../../connection'
import layerViews from '../../services/layer-views'
// import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import {
  apiError,
  nextError,
  apiDataError,
  notAllowedError
} from '../../services/error-response'
import csurf from 'csurf'
import isAuthenticated from '../../services/auth-check'
import pageOptions from '../../services/page-options-helper'
import local from '../../local'
import Crypto from 'crypto'
import { LineString } from 'geojson'

const csrfProtection = csurf({
  cookie: false
})

export default function (app: any): void {
  app.get(
    '/feature/:layer_id/:id/*',
    csrfProtection,
    async (req, res, next) => {
      const id = req.params.id
      const layer_id = Number.parseInt(req.params.layer_id || '', 10)

      const mhid = id.includes(':') ? id : `${layer_id}:${id}`

      let user_id = -1

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
              const photos = await PhotoAttachment.getPhotosForFeature(
                layer_id,
                mhid
              )
              let photo

              if (photos && Array.isArray(photos)) {
                photo = photos[0]
              }

              let featureName = 'Feature'

              if (
                geoJSON.features.length > 0 &&
                geoJSON.features[0].properties
              ) {
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
                return app.next.render(
                  req,
                  res,
                  '/featureinfo',
                  await pageOptions(req, {
                    title: featureName + ' - ' + local.productName,
                    talkComments: true,
                    props: {
                      feature,
                      notes,
                      photo,
                      layer,
                      canEdit: false
                    },
                    cache: false
                  })
                )
              } else {
                const allowed = await Layer.allowedToModify(layer_id, user_id)

                return allowed
                  ? app.next.render(
                      req,
                      res,
                      '/featureinfo',
                      await pageOptions(req, {
                        title: featureName + ' - ' + local.productName,
                        talkComments: true,
                        props: {
                          feature,
                          notes,
                          photo,
                          layer,
                          canEdit: true
                        }
                      })
                    )
                  : app.next.render(
                      req,
                      res,
                      '/featureinfo',
                      await pageOptions(req, {
                        title: featureName + ' - ' + local.productName,
                        talkComments: true,
                        props: {
                          feature,
                          notes,
                          photo,
                          layer,
                          canEdit: false
                        }
                      })
                    )
              }
            } else {
              return res.redirect('/notfound?path=' + req.path)
            }
          } else {
            return res.redirect('/notfound?path=' + req.path)
          }
        } catch (err) {
          nextError(next)(err)
        }
      } else {
        next(new Error('Missing Required Data'))
      }
    }
  )
  app.get('/api/feature/json/:layer_id/:id/*', async (req, res) => {
    const id = req.params.id
    const layer_id = Number.parseInt(req.params.layer_id || '', 10)

    const mhid = id.includes(':') ? id : `${layer_id}:${id}`

    if (mhid && layer_id) {
      try {
        const geoJSON = await Feature.getGeoJSON(mhid, layer_id)
        const resultStr = JSON.stringify(geoJSON)

        const hash = Crypto.createHash('md5').update(resultStr).digest('hex')

        const match = req.get('If-None-Match')

        /* eslint-disable security/detect-possible-timing-attacks */
        if (hash === match) {
          res.status(304).send()
        } else {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            ETag: hash
          })
          res.end(resultStr)
        }

        return
      } catch (err) {
        apiError(res, 500)(err)
      }
    } else {
      apiDataError(res)
    }
  })
  app.get('/api/feature/gpx/:layer_id/:id/*', async (req, res, next) => {
    const id = req.params.id
    const layer_id = Number.parseInt(req.params.layer_id || '', 10)

    if (id && layer_id) {
      try {
        const mhid = `${layer_id}:${id}`
        const layer = await Layer.getLayerByID(layer_id)

        if (layer) {
          const geoJSON = await Feature.getGeoJSON(mhid, layer.layer_id)
          const firstFeature = geoJSON.features[0]
          const firstGeometry = firstFeature.geometry as LineString
          firstGeometry.type = 'LineString'
          const coordinates = firstGeometry.coordinates[0] //[0]
          //log.info(coordinates)
          const resultStr = JSON.stringify(geoJSON)
          //log.info(resultStr)

          const hash = Crypto.createHash('md5').update(resultStr).digest('hex')

          const match = req.get('If-None-Match')

          if (hash === match) {
            return res.status(304).send()
          } else {
            res.writeHead(200, {
              'Content-Type': 'application/gpx+xml',
              ETag: hash
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
            for (const coord of coordinates) {
              gpx += ` <trkpt lon="${coord[0]}" lat="${coord[1]}"></trkpt>`
            }
            gpx += `
                </trkseg>
              </trk>
              </gpx>`
            return res.end(gpx)
          }
        } else {
          res.redirect('/notfound?path=' + req.path)
        }
      } catch (err) {
        nextError(next)(err)
      }
    } else {
      next(new Error('Missing Required Data'))
    }
  })
  app.post(
    '/api/feature/notes/save',
    csrfProtection,
    isAuthenticated,
    async (req, res) => {
      const data = req.body

      if (data && data.layer_id && data.mhid && data.notes) {
        try {
          return (await Layer.allowedToModify(data.layer_id, req.user_id))
            ? knex.transaction(async (trx) => {
                await Feature.saveFeatureNote(
                  data.mhid,
                  data.layer_id,
                  req.user_id,
                  data.notes,
                  trx
                )
                return res.send({
                  success: true
                })
              })
            : notAllowedError(res, 'layer')
        } catch (err) {
          apiError(res, 500)(err)
        }
      } else {
        apiDataError(res)
      }
    }
  )
  app.post(
    '/api/feature/photo/add',
    csrfProtection,
    isAuthenticated,
    async (req, res) => {
      const data = req.body

      if (data && data.layer_id && data.mhid && data.image && data.info) {
        try {
          return (await Layer.allowedToModify(data.layer_id, req.user_id))
            ? knex.transaction(async (trx) => {
                // set will replace existing photo
                const photo_url = await PhotoAttachment.setPhotoAttachment(
                  data.layer_id,
                  data.mhid,
                  data.image,
                  data.info,
                  req.alloweduser_id,
                  trx
                )
                // add a tag to the feature and update the layer
                const layer = await Layer.getLayerByID(data.layer_id, trx)

                if (layer) {
                  await LayerData.setStringTag(
                    layer.layer_id,
                    data.mhid,
                    'photo_url',
                    photo_url,
                    trx
                  )
                  const presets = await PhotoAttachment.addPhotoUrlPreset(
                    layer,
                    req.user_id,
                    trx
                  )
                  await layerViews.replaceViews(data.layer_id, presets, trx)
                  await Layer.setUpdated(data.layer_id, req.user_id, trx)
                  return res.send({
                    success: true,
                    photo_url
                  })
                } else {
                  return res.send({
                    success: false,
                    error: 'layer not found'
                  })
                }
              })
            : notAllowedError(res, 'layer')
        } catch (err) {
          apiError(res, 500)(err)
        }
      } else {
        apiDataError(res)
      }
    }
  )
  app.post(
    '/api/feature/photo/delete',
    csrfProtection,
    isAuthenticated,
    async (req, res) => {
      const data = req.body

      if (data && data.layer_id && data.mhid) {
        Layer.allowedToModify(data.layer_id, req.user_id)
          .then((allowed) => {
            return allowed
              ? knex
                  .transaction(async (trx) => {
                    // set will replace existing photo
                    await PhotoAttachment.deletePhotoAttachment(
                      data.layer_id,
                      data.mhid,
                      trx
                    )
                    const layer = await Layer.getLayerByID(data.layer_id, trx)

                    if (layer) {
                      // remove the photo URL from feature
                      await LayerData.setStringTag(
                        layer.layer_id,
                        data.mhid,
                        'photo_url',
                        null,
                        trx
                      )
                      await layerViews.replaceViews(
                        data.layer_id,
                        layer.presets,
                        trx
                      )
                      await Layer.setUpdated(data.layer_id, req.user_id, trx)
                      return res.send({
                        success: true
                      })
                    } else {
                      return res.send({
                        success: false,
                        error: 'layer not found'
                      })
                    }
                  })
                  .catch(apiError(res, 500))
              : notAllowedError(res, 'layer')
          })
          .catch(apiError(res, 500))
      } else {
        apiDataError(res)
      }
    }
  )
}
