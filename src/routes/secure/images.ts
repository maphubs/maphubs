const Image = require('../../models/image')

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')(
  'routes/images'
)

const apiError = require('../../services/error-response').apiError

const nextError = require('../../services/error-response').nextError

const imageUtils = require('../../services/image-utils')

const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

module.exports = function (app: any) {
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
            ETag: require('crypto').createHash('md5').update(img).digest('hex')
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

      if (result?.image) {
        return imageUtils.processImage(result.image, req, res)
      } else {
        return res.status(404).send()
      }
    } catch (err) {
      apiError(res, 404)(err)
    }
  })
  app.get('/group/:id/thumbnail', (req, res) => {
    const group_id = req.params.id
    Image.getGroupThumbnail(group_id)
      .then((result) => {
        if (result && result.thumbnail) {
          return imageUtils.processImage(result.thumbnail, req, res)
        } else {
          return res.status(404).send()
        }
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
        if (result && result.image) {
          return imageUtils.processImage(result.image, req, res)
        } else {
          return res.status(404).send()
        }
      })
      .catch(apiError(res, 404))
  })
  app.get('/images/story/:storyid/thumbnail/:imageid.jpg', (req, res) => {
    const story_id = req.params.storyid
    const image_id = req.params.imageid
    Image.getStoryThumbnail(story_id, image_id)
      .then((result) => {
        if (result && result.thumbnail) {
          return imageUtils.processImage(result.thumbnail, req, res)
        } else {
          return res.status(404).send()
        }
      })
      .catch(apiError(res, 404))
  })
}