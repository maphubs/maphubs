import React from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../src/components/Layout'
import ErrorBoundary from '../../../src/components/ErrorBoundary'

import useSWR from 'swr'
import useStickyResult from '../../../src/hooks/useStickyResult'
import useT from '../../../src/hooks/useT'
import { Layer } from '../../../src/types/layer'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import slugify from 'slugify'
import dynamic from 'next/dynamic'
import { NextSeo } from 'next-seo'

const InteractiveMap = dynamic(
  () => import('../../../src/components/Maps/Map/InteractiveMap'),
  {
    ssr: false
  }
)

const LayerMap = (): JSX.Element => {
  const router = useRouter()
  const { t, locale } = useT()

  const slug = router.query.layermap || []
  const layer_id = slug[0]

  const { data } = useSWR([
    `
  {
    layer(id: "{id}") {
      layer_id
      name
      description
      source
      style
      owned_by_group_id
      remote
      creation_time
    }
    mapConfig
  }
  `,
    layer_id
  ])
  const stickyData: {
    layer: Layer
    mapConfig: Record<string, unknown>
  } = useStickyResult(data) || {}
  const { layer, mapConfig } = stickyData

  const baseUrl = urlUtil.getBaseUrl()
  const canonical = `${baseUrl}/layer/${layer.layer_id}/${slugify(
    t(layer.name)
  )}`
  const imageUrl = `${baseUrl}/api/screenshot/layer/image/${layer.layer_id}.png`

  return (
    <>
      <NextSeo
        title={t(layer.name)}
        description={t(layer.description)}
        canonical={canonical}
        openGraph={{
          url: canonical,
          title: t(layer.name),
          description: t(layer.description),
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: t(layer.name)
            }
          ],
          site_name: process.env.NEXT_PUBLIC_PRODUCT_NAME
        }}
        twitter={{
          handle: process.env.NEXT_PUBLIC_TWITTER,
          site: process.env.NEXT_PUBLIC_TWITTER,
          cardType: 'summary'
        }}
      />
      <ErrorBoundary t={t}>
        <Layout title={t(layer.name)} hideFooter>
          <div
            className='no-margin'
            style={{
              margin: 0,
              height: 'calc(100% - 50px)',
              width: '100%'
            }}
          >
            <InteractiveMap
              height='100%'
              fitBounds={layer.preview_position.bbox}
              style={layer.style}
              layers={[layer]}
              map_id={layer.layer_id}
              mapConfig={mapConfig}
              disableScrollZoom={false}
              title={layer.name}
              hideInactive={false}
              showTitle={false}
              primaryColor={process.env.NEXT_PUBLIC_PRIMARY_COLOR}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
              earthEngineClientID={process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID}
              locale={locale}
            />
          </div>
        </Layout>
      </ErrorBoundary>
    </>
  )
}
export default LayerMap
