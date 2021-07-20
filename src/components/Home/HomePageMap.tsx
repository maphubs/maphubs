import React from 'react'
import getConfig from 'next/config'
import { Row } from 'antd'
import InteractiveMap from '../Map/InteractiveMap'
import useT from '../../hooks/useT'
import { Map } from '../../types/map'
import { Layer } from '../../types/layer'
import useSWR from 'swr'
import useStickyResult from '../../hooks/useStickyResult'

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

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
      sourxe
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
          primaryColor={MAPHUBS_CONFIG.primaryColor}
          logoSmall={MAPHUBS_CONFIG.logoSmall}
          logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
          logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
          mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
          DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
          earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
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
