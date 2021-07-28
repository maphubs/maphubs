import { v4 as uuidv4 } from 'uuid'

import Bluebird from 'bluebird'

import fsNode from 'fs'
const fs = Bluebird.promisifyAll(fsNode)

import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import easyimg from 'easyimage'
import Crypto from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'

const debug = DebugService('image-utils')

export default {
  processImage(image: string, req: NextApiRequest, res: NextApiResponse): void {
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

    const hash = Crypto.createHash('md5').update(img).digest('hex')

    const match = req.headers['If-None-Match']

    /* eslint-disable security/detect-possible-timing-attacks */
    if (hash === match) {
      res.status(304).send('')
    } else {
      res.writeHead(200, {
        'Content-Type': dataType,
        'Content-Length': img.length,
        ETag: hash
      })
      res.end(img)
    }
  },

  decodeBase64Image(dataString: string):
    | Error
    | {
        data: Buffer
        type: any
      } {
    const matches: any = dataString.match(/^data:([+/A-Za-z-]+);base64,(.+)$/)

    if (matches.length !== 3) {
      return new Error('Invalid input string')
    }

    return {
      type: matches[1],
      data: Buffer.from(matches[2], 'base64')
    }
  },

  async resizeBase64(
    dataString: string,
    targetWidth: number,
    targetHeight: number,
    crop = false
  ): Promise<any> {
    const origFile = uuidv4() + '.png'
    const resizedFile = uuidv4() + '.png'
    const convertedFile = uuidv4() + '.jpg'
    const origfilePath = process.env.TEMP_FILE_PATH + '/' + origFile
    const resizedFilePath = process.env.TEMP_FILE_PATH + '/' + resizedFile
    const convertedFilePath = process.env.TEMP_FILE_PATH + '/' + convertedFile

    try {
      // decode base64
      const imageBuffer = this.decodeBase64Image(dataString)

      // save it to a file
      await fs.writeFileAsync(origfilePath, imageBuffer.data)
      const options = {
        src: origfilePath,
        dst: resizedFilePath,
        background: 'white',
        cropWidth: undefined,
        cropHeight: undefined,
        width: targetWidth,
        height: targetHeight
      }
      let resizedImage

      if (crop) {
        options.cropWidth = targetWidth
        options.cropHeight = targetHeight
        debug.log('cropping')
        resizedImage = await easyimg.crop(options)
      } else {
        debug.log('resizing')
        resizedImage = await easyimg.resize(options)
      }

      debug.log(
        'Resized and cropped: ' +
          resizedImage.width +
          ' x ' +
          resizedImage.height
      )
      await easyimg.convert({
        src: resizedFilePath,
        dst: convertedFilePath,
        quality: 85
      })
      // using configured temp path and uuid's, no user input used in path
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const bitmap = fs.readFileSync(convertedFilePath)
      const resizedImageBase64String =
        'data:image/jpeg;base64,' + Buffer.from(bitmap).toString('base64')

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
