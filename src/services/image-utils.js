// @flow
import { v4 as uuidv4 } from 'uuid'
const Promise = require('bluebird')
const fs: typeof fs = Promise.promisifyAll(require('fs'))
const local = require('../local')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('image-utils')
const easyimg = require('easyimage')

module.exports = {

  processImage (image: string, req: any, res: any) {
    if (!image) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': 0
      })
      res.end('')
      return
    }
    const dataArr = image.split(',')
    const dataInfoArr = dataArr[0].split(':')[1].split(';')
    const dataType = dataInfoArr[0]
    const data = dataArr[1]
    const img = Buffer.from(data, 'base64')
    const hash = require('crypto').createHash('md5').update(img).digest('hex')
    const match = req.get('If-None-Match')
    /* eslint-disable security/detect-possible-timing-attacks */
    if (hash === match) {
      res.status(304).send()
    } else {
      res.writeHead(200, {
        'Content-Type': dataType,
        'Content-Length': img.length,
        ETag: hash
      })
      res.end(img)
    }
  },

  decodeBase64Image (dataString: string) {
    const matches: any = dataString.match(/^data:([+/A-Za-z-]+);base64,(.+)$/)
    const response = {}

    if (matches.length !== 3) {
      return new Error('Invalid input string')
    }

    response.type = matches[1]
    response.data = Buffer.from(matches[2], 'base64')

    return response
  },

  async resizeBase64 (dataString: string, targetWidth: number, targetHeight: number, crop: boolean = false) {
    const _this = this
    const origFile = uuidv4() + '.png'
    const resizedFile = uuidv4() + '.png'
    const convertedFile = uuidv4() + '.jpg'
    const origfilePath = local.tempFilePath + '/' + origFile
    const resizedFilePath = local.tempFilePath + '/' + resizedFile
    const convertedFilePath = local.tempFilePath + '/' + convertedFile
    try {
      // decode base64
      const imageBuffer = _this.decodeBase64Image(dataString)
      // save it to a file

      await fs.writeFileAsync(origfilePath, imageBuffer.data)
      const options = {
        src: origfilePath,
        dst: resizedFilePath,
        background: 'white',
        cropwidth: undefined,
        cropheight: undefined,
        width: targetWidth,
        height: targetHeight
      }
      let resizedImage
      if (crop) {
        options.cropwidth = targetWidth
        options.cropheight = targetHeight
        debug.log('cropping')
        resizedImage = await easyimg.crop(options)
      } else {
        debug.log('resizing')
        resizedImage = await easyimg.resize(options)
      }
      debug.log('Resized and cropped: ' + resizedImage.width + ' x ' + resizedImage.height)
      await easyimg.convert({
        src: resizedFilePath, dst: convertedFilePath, quality: 85
      })

      // using configured temp path and uuid's, no user input used in path
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const bitmap = fs.readFileSync(convertedFilePath)
      const resizedImageBase64String = 'data:image/jpeg;base64,' + Buffer.from(bitmap).toString('base64')

      /* eslint-disable security/detect-non-literal-fs-filename */
      await fs.unlinkAsync(origfilePath)
      await fs.unlinkAsync(resizedFilePath)
      await fs.unlinkAsync(convertedFilePath)
      return resizedImageBase64String
    } catch (err) {
      try {
        log.error(err)
        await fs.unlinkAsync(origfilePath)
        await fs.unlinkAsync(resizedFilePath)
        await fs.unlinkAsync(convertedFilePath)
      } catch (err) {
        log.error(err)
      }
    }
  }

}
