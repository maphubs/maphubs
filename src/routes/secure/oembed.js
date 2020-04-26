import Locales from '../../services/locales'
const Map = require('../../models/map')
const User = require('../../models/user')
const libxml = require('libxmljs')
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('oembed')
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')
const apiError = require('../../services/error-response').apiError

module.exports = function (app) {
  app.get('/api/oembed/map', (req, res) => {
    const url = req.query.url
    const format = req.query.format

    const urlArr = url.split('/')
    const map_id = urlArr[urlArr.length - 2]

    debug.log(map_id)

    const baseUrl = urlUtil.getBaseUrl()

    Map.getMap(map_id).then((map) => {
      return User.getUser(map.created_by).then((user) => {
        const url = `${baseUrl}/map/embed/${map.map_id}/static`
        const imageUrl = `${baseUrl}/api/screenshot/map/${map.map_id}.png`

        const title = Locales.getLocaleStringObject(req.locale, map.title)

        const oembed = {
          type: 'rich',
          version: '1.0',
          provider_name: 'MapHubs',
          provider_url: baseUrl,
          author_name: user.display_name,
          author_url: '',
          author_id: Number.parseInt(map.created_by, 10),
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
          const doc = new libxml.Document()
          doc.node('oembed')
            .node('type', oembed.type).parent()
            .node('version', oembed.version).parent()
            .node('provider_name', oembed.provider_name).parent()
            .node('provider_url', oembed.provider_url).parent()
            .node('author_name', oembed.author_name).parent()
            .node('author_url', oembed.author_url).parent()
            .node('author_id', oembed.author_id).parent()
            .node('title', oembed.title).parent()
            .node('html', oembed.html).parent()
            .node('thumbnail', oembed.thumbnail).parent()
            .node('thumbnail_height', oembed.thumbnail_height.toString()).parent()
            .node('thumbnail_width', oembed.thumbnail_width.toString()).parent()
            .node('height', oembed.height.toString()).parent()
            .node('width', oembed.width.toString()).parent()
            .node('map_id', oembed.map_id.toString()).parent()

          res.header('Content-Type', 'text/xml')
          return res.send(doc.toString())
        } else {
        // just use JSON
          return res.status(200).send(oembed)
        }
      })
    }).catch(apiError(res, 500))
  })
}
