import React from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../src/components/Layout'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import getConfig from 'next/config'
import useSWR from 'swr'
import useStickyResult from '../../../src/hooks/useStickyResult'
import useT from '../../../src/hooks/useT'
import { Layer } from '../../../src/types/layer'
import dynamic from 'next/dynamic'
const InteractiveMap = dynamic(
  () => import('../../../src/components/Map/InteractiveMap'),
  {
    ssr: false
  }
)

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

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

  return (
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
            primaryColor={MAPHUBS_CONFIG.primaryColor}
            logoSmall={MAPHUBS_CONFIG.logoSmall}
            logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
            logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
            mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
            DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
            earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
            t={t}
            locale={locale}
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default LayerMap
