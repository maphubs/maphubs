import React from 'react'

import { Row } from 'antd'
import useT from '../../hooks/useT'
import { Map } from '../../types/map'
import { Layer } from '../../types/layer'
import useSWR from 'swr'
import useStickyResult from '../../hooks/useStickyResult'
import dynamic from 'next/dynamic'
const InteractiveMap = dynamic(() => import('../Maps/Map/InteractiveMap'), {
  ssr: false
})

const HomePageMap = ({
  map_id,
  style
}: {
  map_id: number
  style: React.CSSProperties
}): JSX.Element => {
  const { t } = useT()

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
    mapConfig
  }
  `,
    map_id
  ])
  const stickyData: {
    map: Map
    mapLayers: Layer[]
    mapConfig: Record<string, unknown>
  } = useStickyResult(data) || {}
  const { map, mapLayers, mapConfig } = stickyData

  let homepageMap = <></>

  if (map) {
    homepageMap = (
      <Row style={style || {}}>
        <InteractiveMap
          height='calc(100vh - 150px)'
          {...map}
          mapConfig={mapConfig}
          layers={mapLayers}
          showTitle={false}
          primaryColor={process.env.NEXT_PUBLIC_PRIMARY_COLOR}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
          earthEngineClientID={process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID}
          {...map.settings}
          t={t}
        />
        <div className='divider' />
      </Row>
    )
  }

  return homepageMap
}
export default HomePageMap
