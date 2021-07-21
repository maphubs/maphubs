import React from 'react'
import Layout from '../../../src/components/Layout'
import slugify from 'slugify'
import '../services/locales'

import ErrorBoundary from '../../../src/components/ErrorBoundary'
import type { Layer } from '../../../src/types/layer'
import type { Group } from '../../../src/stores/GroupStore'
import getConfig from 'next/config'
import { LocalizedString } from '../../../src/types/LocalizedString'
import useT from '../../../src/hooks/useT'

import dynamic from 'next/dynamic'
const MapMaker = dynamic(
  () => import('../../../src/components/MapMaker/MapMaker'),
  {
    ssr: false
  }
)

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  popularLayers: Array<Layer>
  myLayers: Array<Layer>
  groups: Array<Group>
  editLayer: Record<string, any>
  mapConfig: Record<string, any>
}
const NewMap = (): JSX.Element => {
  const { t } = useT()
  /*
  constructor(props: Props) {
    super(props)

    const baseMapContainerInit: {
      baseMap?: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
    } = {
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }

    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()
  }
  */

  const mapCreated = (mapId: number, title: LocalizedString): void => {
    window.location.assign('/map/view/' + mapId + '/' + slugify(this.t(title)))
  }

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('New Map')} activePage='map' hideFooter>
        <div
          style={{
            height: 'calc(100% - 52px)',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          <MapMaker
            mapConfig={mapConfig}
            onCreate={mapCreated}
            popularLayers={popularLayers}
            myLayers={myLayers}
            editLayer={editLayer}
            groups={groups}
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default NewMap
