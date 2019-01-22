// @flow
const Layer = require('../../models/layer')
const login = require('connect-ensure-login')
const Group = require('../../models/group')
const multer = require('multer')
const local = require('../../local')
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('routes/layers-import')
const apiError = require('../../services/error-response').apiError
const nextError = require('../../services/error-response').nextError
const apiDataError = require('../../services/error-response').apiDataError
const notAllowedError = require('../../services/error-response').notAllowedError
const isAuthenticated = require('../../services/auth-check')
const geobuf = require('@bit/kriscarle.maphubs-utils.maphubs-utils.importers').geobuf
const _endsWith = require('lodash.endswith')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')
const knex = require('../../connection')
const shortid = require('shortid')
const replaceShortID = require('../../components/Map/Styles/replaceShortID')
const DataLoadUtils = require('../../services/data-load-utils')
const layerViews = require('../../services/layer-views')
const pageOptions = require('../../services/page-options-helper')

const SUPPORTED_VERSION = 1

module.exports = function (app: any) {
  app.get('/importlayer', login.ensureLoggedIn(), async (req, res, next) => {
    try {
      const user_id = req.session.user.maphubsUser.id
      return app.next.render(req, res, '/importlayer', await pageOptions(req, {
        title: req.__('Import Layer') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          groups: await Group.getGroupsForUser(user_id)
        }
      }))
    } catch (err) { nextError(next)(err) }
  })

  app.post('/api/import/layer/:group_id/upload', isAuthenticated, multer({dest: local.tempFilePath + '/uploads/'}).single('file'),
    async (req, res) => {
      try {
        const group_id = req.params.group_id
        debug.log('adding to group: ' + group_id)
        if (group_id) {
          if (await Group.allowedToModify(group_id, req.user_id)) {
            debug.log('Filename: ' + req.file.originalname)
            debug.log('Mimetype: ' + req.file.mimetype)
            if (_endsWith(req.file.originalname, '.maphubs')) {
              const importerResult = await geobuf(req.file.path, -1)
              const maphubsFile = importerResult.maphubs
              const maphubsLayer = maphubsFile.layer
              const presets = maphubsLayer.presets

              delete importerResult.maphubs

              if (maphubsFile && maphubsFile.version >= SUPPORTED_VERSION) {
                log.info(`MapHubs File v${maphubsFile.version} - Generated by ${maphubsFile.host}(${maphubsFile.systemVersion}) at ${maphubsFile.exportTime} `)

                // replace shortid
                const newId = shortid.generate()
                const oldId = maphubsLayer.shortid
                maphubsLayer.shortid = newId

                maphubsLayer.style = replaceShortID(oldId, newId, maphubsLayer.style)

                return knex.transaction(async (trx) => {
                // create the layer
                  const layer_id = await Layer.importLayer(maphubsLayer, group_id, req.user_id, trx)

                  // insert layer data, if provided
                  if (importerResult.features.length > 0) {
                    await DataLoadUtils.storeTempGeoJSON(importerResult, req.file.path, layer_id, maphubsLayer.shortid, false, false, trx)
                    await DataLoadUtils.loadTempData(layer_id, trx, maphubsLayer.disable_feature_indexing)
                    await layerViews.createLayerViews(layer_id, presets, trx)
                    debug.log('data load transaction complete')
                  }
                  await Layer.setComplete(layer_id, trx)
                  return res.status(200).send({success: true, layer_id})
                })
              } else {
                throw new Error('Unsupported MapHubs file format')
              }
            } else {
            // only .maphubs files supported
              throw new Error('MapHubs File Not Found')
            }
          } else {
            return notAllowedError(res, 'layer')
          }
        } else {
          apiDataError(res)
        }
      } catch (err) { apiError(res, 500)(err) }
    })
}
