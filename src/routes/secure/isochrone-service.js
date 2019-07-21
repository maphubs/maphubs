// @flow
import request from 'superagent'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import {apiDataError, apiError} from '../../services/error-response'
import local from '../../local'

module.exports = function (app: any) {
  app.post('/api/isochrone', async (req, res) => {
    const data = req.body
    if (data && data.point) {
      try {
        const requestURL = `https://api.openrouteservice.org/isochrones?&api_key=${local.OPENROUTESERVICE_API_KEY}&locations=${data.point.lng},${data.point.lat}&profile=driving-car&range_type=time&range=3600&interval=900&location_type=start`

        log.info(`Isochrone request: ${requestURL}`)
        const result = await request.get(requestURL).type('json').timeout(60000)

        res.status(200).send(result.body)
      } catch (err) { apiError(res, 500)(err) }
    } else {
      apiDataError(res)
    }
  })
}
