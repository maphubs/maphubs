import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../src/auth/check-user'
import MapModel from '../../../src/models/map'
import { apiError } from '../../../src/services/error-response'
import Locales from '../../../src/services/locales'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'

const debug = DebugService('oembed')

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

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

  const url = req.query.url as string
  const format = req.query.format as string
  const locale = (req.query.locale as string) || 'en'
  const urlArr = url.split('/')
  const map_id = Number.parseInt(urlArr[urlArr.length - 2])
  debug.log(map_id)
  const baseUrl = urlUtil.getBaseUrl()
  try {
    const map = await MapModel.getMap(map_id)
    const url = `${baseUrl}/map/embed/${map.map_id}/static`
    const imageUrl = `${baseUrl}/api/screenshot/map/${map.map_id}.png`
    const title = Locales.getLocaleStringObject(locale, map.title)
    const oembed = {
      type: 'rich',
      version: '1.0',
      provider_name: 'MapHubs',
      provider_url: baseUrl,
      author_url: '',
      author_id: Number.parseInt(map.owned_by_group_id, 10),
      title,
      height: 630,
      width: 1200,
      html: `<iframe src="${url}" width="1200" height="630" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" frameborder="0"></iframe>`,
      thumbnail: imageUrl,
      thumbnail_height: 600,
      thumbnail_width: 315,
      map_id: map.map_id
    }

    if (format === 'xml') {
      res.status(501).send('Ombed XML not available, please use JSON')
      //TODO: write oembed XML using a JS only XML builder to avoid libxml
      /*
          const doc = new libxml.Document()
          doc
            .node('oembed')
            .node('type', oembed.type)
            .parent()
            .node('version', oembed.version)
            .parent()
            .node('provider_name', oembed.provider_name)
            .parent()
            .node('provider_url', oembed.provider_url)
            .parent()
            .node('author_name', oembed.author_name)
            .parent()
            .node('author_url', oembed.author_url)
            .parent()
            .node('author_id', oembed.author_id)
            .parent()
            .node('title', oembed.title)
            .parent()
            .node('html', oembed.html)
            .parent()
            .node('thumbnail', oembed.thumbnail)
            .parent()
            .node('thumbnail_height', oembed.thumbnail_height.toString())
            .parent()
            .node('thumbnail_width', oembed.thumbnail_width.toString())
            .parent()
            .node('height', oembed.height.toString())
            .parent()
            .node('width', oembed.width.toString())
            .parent()
            .node('map_id', oembed.map_id.toString())
            .parent()
          res.header('Content-Type', 'text/xml')
          return res.send(doc.toString())
          */
    } else {
      // just use JSON
      return res.status(200).send(oembed)
    }
  } catch (err) {
    apiError(res, 500)(err)
  }
}
export default handler
