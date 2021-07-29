import { GetServerSideProps } from 'next'
import React from 'react'
import urlUtil from '../src/services/url-util'
import siteMapUtil from '../src/services/sitemap-util'
import { SitemapIndexStream } from 'sitemap'

const SitemapIndex: React.FC = () => null

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
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

    const layerUrls = await siteMapUtil.getSiteMapIndexFeatureURLs()
    const smis = new SitemapIndexStream()
    smis.pipe(res).on('error', (e) => {
      throw e
    })
    smis.write({ url: `${baseUrl}/sitemap.xml` })
    for (const url of layerUrls) {
      smis.write({ url })
    }
    smis.end()
    // send the response
  }
  return {
    props: {}
  }
}

export default SitemapIndex
