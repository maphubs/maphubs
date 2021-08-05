import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../src/components/Layout'
import slugify from 'slugify'
import { message, notification } from 'antd'

import ErrorBoundary from '../../src/components/ErrorBoundary'
import type { Layer } from '../../src/types/layer'
import type { Group } from '../../src/types/group'

import { LocalizedString } from '../../src/types/LocalizedString'
import useT from '../../src/hooks/useT'

import dynamic from 'next/dynamic'
import { MapMakerState } from '../../src/components/Maps/redux/reducers/mapMakerSlice'
const MapMaker = dynamic(
  () => import('../../src/components/Maps/MapMaker/MapMaker'),
  {
    ssr: false
  }
)

type Props = {
  popularLayers: Array<Layer>
  myLayers: Array<Layer>
  groups: Array<Group>
  editLayer: Record<string, any>
  mapConfig: Record<string, any>
}
const NewMap = (): JSX.Element => {
  const { t } = useT()
  const router = useRouter()
  const [saved, setSaved] = useState(false)

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
      bingKey: process.env.NEXT_PUBLIC_BING_KEY,
      mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }

    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()
  }
  */

  const mapCreated = (mapId: number, title: LocalizedString): void => {
    router.push('/map/view/' + mapId + '/' + slugify(t(title)))
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
            onSave={(mapMakerState: MapMakerState) => {
              // TODO: call mutation to save map
              setSaved(true)
            }}
            onCreate={(mapMakerState: MapMakerState) => {
              // TODO: call mutation to create map
            }}
            onDelete={(map_id: number) => {
              // TODO: call mutation to delete map
              Actions.deleteMap(map_id, (err) => {
                if (err) {
                  notification.error({
                    message: t('Error'),
                    description: err.message || err.toString() || err,
                    duration: 0
                  })
                } else {
                  router.push('/maps')
                }
              })
            }}
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
