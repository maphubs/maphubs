import request from 'superagent'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import knex from '../connection'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import Crypto from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'

const debug = DebugService('screenshot-utils')

const screenshotOptions = {
  url: '',
  width: 400,
  height: 300,
  type: 'jpeg',
  quality: 0.8,
  selector: '#map-load-complete',
  selectorOptions: {
    timeout: 90_000
  },
  cookies: [
    {
      name: 'manet',
      value: process.env.SCREENSHOT_API_KEY,
      domain: process.env.NEXT_PUBLIC_EXTERNAL_HOST,
      path: '/'
    }
  ]
}
export default {
  base64Download(url: string, data: any): any {
    return request
      .post(url)
      .type('json')
      .send(data)
      .timeout(60_000)
      .then((res) => {
        return res.body.toString('base64')
      })
  },

  getLayerThumbnail(layer_id: number): any {
    const _this = this

    debug.log('get thumbnail image for layer: ' + layer_id)
    return knex('omh.layers')
      .select('thumbnail')
      .where({
        layer_id
      })
      .then((result) => {
        if (
          result &&
          result.length === 1 &&
          result[0].thumbnail !== null &&
          result[0].thumbnail.length > 0
        ) {
          debug.log('found image in database for layer: ' + layer_id)
          return result[0].thumbnail
        } else {
          debug.log('no image in database for layer: ' + layer_id)
          return _this.updateLayerThumbnail(layer_id)
        }
      })
  },

  async updateLayerThumbnail(layer_id: number): Promise<any> {
    debug.log('updating image for layer: ' + layer_id)
    const width = 400
    const height = 300
    const maphubsUrl =
      urlUtil.getBaseUrl() + '/api/layer/' + layer_id + '/static/render/'
    const options = Object.assign(screenshotOptions, {
      url: maphubsUrl,
      width,
      height,
      type: 'jpeg',
      quality: 0.8
    })
    debug.log(JSON.stringify(options))
    const image = await this.base64Download(
      process.env.SCREENSHOT_SERVICE_URL,
      options
    )
    await knex('omh.layers')
      .update({
        thumbnail: image
      })
      .where({
        layer_id
      })
    log.info('Updated Layer Thumbnail: ' + layer_id)
    return image
  },

  reloadLayerThumbnail(layer_id: number): any {
    const _this = this

    return knex('omh.layers')
      .update({
        thumbnail: null
      })
      .where({
        layer_id
      })
      .then(() => {
        // don't return the promise because we want this to run async
        _this.updateLayerThumbnail(layer_id)

        return true
      })
  },

  // Layer image
  getLayerImage(layer_id: number): any {
    const _this = this

    debug.log('get image for layer: ' + layer_id)
    return knex('omh.layers')
      .select('screenshot')
      .where({
        layer_id
      })
      .then((result) => {
        if (
          result &&
          result.length === 1 &&
          result[0].screenshot !== null &&
          result[0].screenshot.length > 0
        ) {
          debug.log('found image in database for layer: ' + layer_id)
          return result[0].screenshot
        } else {
          debug.log('no image in database for layer: ' + layer_id)
          return _this.updateLayerImage(layer_id)
        }
      })
  },

  async updateLayerImage(layer_id: number): Promise<any> {
    debug.log('updating image for layer: ' + layer_id)
    // get screenshot from the manet service
    const width = 1200
    const height = 630
    const baseUrl = urlUtil.getBaseUrl() // use internal route

    const maphubsUrl = baseUrl + '/api/layer/' + layer_id + '/static/render/'
    const options = Object.assign(screenshotOptions, {
      url: maphubsUrl,
      width,
      height,
      type: 'png',
      quality: 1
    })
    debug.log(JSON.stringify(options))
    // replace image in database
    const image = await this.base64Download(
      process.env.SCREENSHOT_SERVICE_URL,
      options
    )
    await knex('omh.layers')
      .update({
        screenshot: image
      })
      .where({
        layer_id
      })
    log.info('Updated Layer Image: ' + layer_id)
    return image
  },

  async reloadLayerImage(layer_id: number): Promise<boolean> {
    await knex('omh.layers')
      .update({
        screenshot: null
      })
      .where({
        layer_id
      })
    // don't return the promise because we want this to run async
    this.updateLayerImage(layer_id)
    return true
  },

  // Map Image
  async getMapImage(map_id: number): Promise<string> {
    debug.log('get screenshot image for map: ' + map_id)
    const result = await knex('omh.maps').select('screenshot').where({
      map_id
    })

    if (
      result &&
      result.length === 1 &&
      result[0].screenshot !== null &&
      result[0].screenshot.length > 0
    ) {
      debug.log('found image in database for map: ' + map_id)
      return result[0].screenshot
    } else {
      debug.log('no image in database for map: ' + map_id)
      return this.updateMapImage(map_id)
    }
  },

  async updateMapImage(map_id: number): Promise<any> {
    debug.log('updating image for map: ' + map_id)
    // get screenshot from the manet service
    const width = 1200
    const height = 630
    const maphubsUrl =
      urlUtil.getBaseUrl() + '/api/map/' + map_id + '/static/render/'
    const options = Object.assign(screenshotOptions, {
      url: maphubsUrl,
      width,
      height,
      type: 'png',
      quality: 1
    })
    debug.log(JSON.stringify(options))
    // replace image in database
    const image = await this.base64Download(
      process.env.SCREENSHOT_SERVICE_URL,
      options
    )
    await knex('omh.maps')
      .update({
        screenshot: image
      })
      .where({
        map_id
      })
    log.info('Updated Map Image: ' + map_id)
    return image
  },

  async reloadMapImage(map_id: number): Promise<boolean> {
    await knex('omh.maps')
      .update({
        screenshot: null
      })
      .where({
        map_id
      })
    // don't return the promise because we want this to run async
    this.updateMapImage(map_id)
    return true
  },

  async updateMapThumbnail(map_id: number): Promise<any> {
    debug.log('updating thumbnail for map: ' + map_id)
    // get screenshot from the manet service
    const width = 400
    const height = 300
    const maphubsUrl =
      urlUtil.getBaseUrl() + '/api/map/' + map_id + '/static/render/thumbnail'

    const options = Object.assign(screenshotOptions, {
      url: maphubsUrl,
      width,
      height,
      type: 'jpeg',
      quality: 0.8
    })
    debug.log(JSON.stringify(options))
    // replace image in database
    debug.log(process.env.SCREENSHOT_SERVICE_URL)
    const image = await this.base64Download(
      process.env.SCREENSHOT_SERVICE_URL,
      options
    )
    await knex('omh.maps')
      .update({
        thumbnail: image
      })
      .where({
        map_id
      })
    log.info('Updated Map Thumbnail: ' + map_id)
    return image
  },

  async getMapThumbnail(map_id: number): any {
    debug.log('get thumbnail image for map: ' + map_id)

    const result = await knex('omh.maps').select('thumbnail').where({
      map_id
    })

    if (
      result &&
      result.length === 1 &&
      result[0].thumbnail !== null &&
      result[0].thumbnail.length > 0
    ) {
      debug.log('found image in database for map: ' + map_id)
      return result[0].thumbnail
    } else {
      debug.log('no image in database for map: ' + map_id)
      return this.updateMapThumbnail(map_id)
    }
  },

  async reloadMapThumbnail(map_id: number): Promise<boolean> {
    await knex('omh.maps')
      .update({
        thumbnail: null
      })
      .where({
        map_id
      })
    // don't return the promise because we want this to run async
    this.updateMapThumbnail(map_id)
    return true
  },

  returnImage(
    image: string,
    type: string,
    req: NextApiRequest,
    res: NextApiResponse
  ): void {
    const img = Buffer.from(image, 'base64')

    const hash = Crypto.createHash('md5').update(img).digest('hex')

    const match = req.headers['If-None-Match']

    /* eslint-disable security/detect-possible-timing-attacks */
    if (hash === match) {
      res.status(304).send('')
    } else {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length,
        ETag: hash
      })
      res.end(img)
    }
  }
}
