import { GetServerSideProps } from 'next'
import React from 'react'
import urlUtil from '../../src/services/url-util'
import siteMapUtil from '../../src/services/sitemap-util'
import { SitemapStream } from 'sitemap'

const LayerSitemapIndex: React.FC = () => null

export const getServerSideProps: GetServerSideProps = async ({
  res,
  params
}) => {
  if (res) {
    // not supported on private sites
    if (process.env.NEXT_PUBLIC_REQUIRE_LOGIN === 'true') {
      return {
        notFound: true
      }
    }
    const baseUrl = urlUtil.getBaseUrl()
    console.log(`baseUrl: ${baseUrl}`)
    res.setHeader('Content-Type', 'application/xml')
    const fileName = params.layersitemap as string
    const fileParts = fileName.split('.') //sitemap.layer_id.xml
    const layer_id = Number.parseInt(fileParts[1])

    const smStream = new SitemapStream({
      hostname: baseUrl
    })
    // send the response
    smStream.pipe(res).on('error', (e) => {
      throw e
    })
    await siteMapUtil.addLayerFeaturesToSiteMap(layer_id, smStream)
    // finished adding
    smStream.end()
  }
  return {
    props: {}
  }
}

export default LayerSitemapIndex
