import request from 'superagent'
import type { NextApiHandler } from 'next'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import { apiDataError, apiError } from '../../src/services/error-response'

const isochroneHandler: NextApiHandler = async (req, res) => {
  const data = req.body
  if (data && data.point) {
    try {
      const requestURL = `https://api.openrouteservice.org/isochrones?&api_key=${process.env.OPENROUTESERVICE_API_KEY}&locations=${data.point.lng},${data.point.lat}&profile=driving-car&range_type=time&range=3600&interval=900&location_type=start`
      log.info(`Isochrone request: ${requestURL}`)
      const result = await request.get(requestURL).type('json').timeout(60_000)
      res.status(200).send(result.body)
    } catch (err) {
      apiError(res, 500)(err)
    }
  } else {
    apiDataError(res)
  }
}
export default isochroneHandler
