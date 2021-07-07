import Image from '../../models/image'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { apiError, nextError } from '../../services/error-response'
import imageUtils from '../../services/image-utils'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import Crypto from 'crypto'

const debug = DebugService('routes/images')

export default function (app: any): void {
  app.get('/image/:id.*', (req, res, next) => {
    const image_id = Number.parseInt(req.params.id || '', 10)
    // var ext = req.params.ext;
    debug.log('getting image: ' + image_id)
    Image.getImageByID(image_id)
      .then((image) => {
        if (image) {
          const dataArr = image.split(',')
          const dataInfoArr = dataArr[0].split(':')[1].split(';')
          const dataType = dataInfoArr[0]
          const data = dataArr[1]
          const img = Buffer.from(data, 'base64')
          res.writeHead(200, {
            'Content-Type': dataType,
            'Content-Length': img.length,
            ETag: Crypto.createHash('md5').update(img).digest('hex')
          })
          return res.end(img)
        } else {
          res.status(404).send()
        }
      })
      .catch(nextError(next))
  })
  app.get('/group/:id/image.png', async (req, res) => {
    try {
      const group_id = req.params.id
      const result = await Image.getGroupImage(group_id)

      return result?.image
        ? imageUtils.processImage(result.image, req, res)
        : res.status(404).send()
    } catch (err) {
      apiError(res, 404)(err)
    }
  })
  app.get('/group/:id/thumbnail', (req, res) => {
    const group_id = req.params.id
    Image.getGroupThumbnail(group_id)
      .then((result) => {
        return result && result.thumbnail
          ? imageUtils.processImage(result.thumbnail, req, res)
          : res.status(404).send()
      })
      .catch((err) => {
        log.error(err)
      })
  })
  app.get('/images/story/:storyid/image/:imageid.jpg', (req, res) => {
    const story_id = req.params.storyid
    const image_id = req.params.imageid
    Image.getStoryImage(story_id, image_id)
      .then((result) => {
        return result && result.image
          ? imageUtils.processImage(result.image, req, res)
          : res.status(404).send()
      })
      .catch(apiError(res, 404))
  })
  app.get('/images/story/:storyid/thumbnail/:imageid.jpg', (req, res) => {
    const story_id = req.params.storyid
    const image_id = req.params.imageid
    Image.getStoryThumbnail(story_id, image_id)
      .then((result) => {
        return result && result.thumbnail
          ? imageUtils.processImage(result.thumbnail, req, res)
          : res.status(404).send()
      })
      .catch(apiError(res, 404))
  })
}
