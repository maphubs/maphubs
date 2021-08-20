import React from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../src/components/Layout'
import slugify from 'slugify'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import type { Layer } from '../../../src/types/layer'
import type { Group } from '../../../src/types/group'
import { LocalizedString } from '../../../src/types/LocalizedString'
import useT from '../../../src/hooks/useT'
import useSWR from 'swr'
import useStickyResult from '../../../src/hooks/useStickyResult'
import { Map } from '../../../src/types/map'

import dynamic from 'next/dynamic'
const MapMaker = dynamic(
  () => import('../../../src/components/Maps/MapMaker/MapMaker'),
  {
    ssr: false
  }
)

const MapEdit = (): JSX.Element => {
  const router = useRouter()
  const { t } = useT()

  const slug = router.query.layerinfo || []
  const map_id = slug[0]

  const { data } = useSWR([
    `
  {
    map(id: "{id}") {
      map_id
      title
      position
      style
      settings
      basemap
      created_at
      updated_at
      owned_by_group_id
      share_id
    }
    mapLayers(id: "{id}", attachPermissions: true) {
      layer_id
      shortid
      name
      description
      source
      data_type
      style
      legend_html
    }
    popularLayers(limit: 25, attachPermissions: true) {
      layer_id
      shortid
      name
      description
      source
      data_type
      style
      legend_html
    }
    myLayers(limit: 25) {
      layer_id
      shortid
      name
      description
      source
      data_type
      style
      legend_html
    }
    groups {
      group_id
      name
    }
    allowedToModifyMap(id: "{id}")
    
    mapConfig
  }
  `,
    map_id
  ])
  const stickyData: {
    map: Map
    mapLayers: Layer[]
    popularLayers: Layer[]
    myLayers: Layer[]
    groups: Group[]
    allowedToModifyMap: boolean
    mapConfig: Record<string, unknown>
  } = useStickyResult(data) || {}
  const {
    map,
    mapLayers,
    popularLayers,
    myLayers,
    groups,
    allowedToModifyMap,
    mapConfig
  } = stickyData

  const mapCreated = (mapId: string, title: LocalizedString): void => {
    router.push('/map/view/' + mapId + '/' + slugify(t(title)))
  }

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Edit Map')} hideFooter>
        <div
          style={{
            height: 'calc(100% - 52px)',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          <MapMaker
            onCreate={mapCreated}
            mapConfig={mapConfig}
            mapLayers={mapLayers}
            basemap={map.basemap}
            map_id={map.map_id}
            title={map.title}
            owned_by_group_id={map.owned_by_group_id}
            position={map.position}
            settings={map.settings}
            popularLayers={popularLayers}
            myLayers={myLayers}
            groups={groups}
            edit
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default MapEdit
