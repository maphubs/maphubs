import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import fs from 'fs'
import { isMember } from '../../../../src/auth/check-user'
import { apiError, apiDataError } from '../../../../src/services/error-response'
import LayerModel from '../../../../src/models/layer'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import knex from '../../../../src/connection'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import DataLoadUtils from '../../../../src/services/data-load-utils'
import Importers from '@bit/kriscarle.maphubs-utils.maphubs-utils.importers'
import layerViews from '../../../../src/services/layer-views'

const debug = DebugService('layer complete upload')
const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const UPLOAD_PATH = `${process.env.TEMP_FILE_PATH}/uploads`

const getExt = (fileName: string) => {
  if (fileName.endsWith('.zip')) return 'zip'
  if (fileName.endsWith('.pbf')) return 'pbf'
  if (fileName.endsWith('.maphubs')) return 'maphubs'
  if (fileName.endsWith('.csv')) return 'csv'
  if (fileName.endsWith('.kml')) return 'kml'
  if (fileName.endsWith('.kmz')) return 'kmz'
  if (fileName.endsWith('.gpx')) return 'gpx'
  if (fileName.endsWith('.geojson') || fileName.endsWith('.json'))
    return 'geojson'

  const error = fileName.endsWith('.shp')
    ? new Error('Shapefile must uploaded in a Zip file')
    : new Error(`Unsupported file type: ${fileName}`)
  throw error
}

const handler: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }

  if (
    process.env.NEXT_PUBLIC_REQUIRE_LOGIN === 'true' &&
    (!user?.sub || !isMember(user))
  ) {
    return res.status(401).json({
      error: 'Login required'
    })
  }
  const user_id = Number.parseInt(user.sub)

  const { layer_id, uploadUrl, originalName } = req.body

  if (layer_id && uploadUrl && originalName) {
    try {
      const layer = await LayerModel.getLayerByID(layer_id)

      if (layer) {
        const shortid = layer.shortid

        if (layer.created_by_user_id === user_id) {
          const importer = Importers.getImporterFromFileName(originalName)
          const uploadUrlParts = uploadUrl.split('/')
          const fileid = uploadUrlParts[uploadUrlParts.length - 1]
          const path = UPLOAD_PATH + '/' + fileid
          const ext = getExt(originalName)
          const pathWithExt = `${path}.${ext}`
          await new Promise((resolve, reject) => {
            // path set by us with a uuid filename, extension value is not copying directly from user input
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.rename(path, pathWithExt, (error) => {
              if (error) reject(error)
              resolve(null)
            })
          })
          let importerResult

          try {
            importerResult = await importer(pathWithExt, layer_id)
          } catch (err) {
            log.error(err.message)
            apiError(res, 200)(err)
            return
          }

          if (
            importerResult.type &&
            importerResult.type === 'FeatureCollection'
          ) {
            // is geoJSON
            const result = await DataLoadUtils.storeTempGeoJSON(
              importerResult,
              path,
              layer_id,
              shortid,
              false,
              true
            )
            await knex.transaction(async (trx) => {
              return layerViews.createLayerViews(layer_id, layer.presets, trx)
            })
            log.info('Upload Complete')
            res.status(200).send(result)
          } else {
            // pass through other types of results
            return res.status(200).send(importerResult)
          }
        }
      } else {
        return res.status(400).send('layer not found')
      }
    } catch (err) {
      log.error(err.message)
      apiError(res, 200)(err)
    }
  } else {
    debug.log('missing required data')
    apiDataError(res)
  }
}
export default handler
