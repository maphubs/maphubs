/* eslint-disable unicorn/numeric-separators-style */
import React from 'react'
import { Subscribe } from 'unstated'
import FRContainer from './containers/FRContainer'

import useT from '../../hooks/useT'
import dynamic from 'next/dynamic'
const InteractiveMap = dynamic(() => import('../Maps/Map/InteractiveMap'), {
  ssr: false
})

type Props = {
  mapConfig: Record<string, unknown>
  gpxLink: string
}

const FeatureMap = ({ mapConfig, gpxLink }: Props): JSX.Element => {
  const { t, locale } = useT()
  const frToggle = (id: string): void => {
    let map
    if (map.current) {
      switch (id) {
        case 'remaining': {
          map.current.toggleVisibility(99999901)
          break
        }
        case 'loss': {
          map.current.toggleVisibility(99999905)
          break
        }
        case 'glad': {
          map.current.toggleVisibility(99999902)
          break
        }
        case 'ifl': {
          map.current.toggleVisibility(99999903)
          break
        }
        case 'iflloss': {
          map.current.toggleVisibility(99999904)
          break
        }
        // No default
      }
    }
  }

  return (
    <Subscribe to={[FRContainer]}>
      {(FRState) => {
        const { mapLayers, glStyle, featureLayer, geoJSON } = FRState.state
        const bbox = geoJSON ? geoJSON.bbox : undefined
        return (
          <InteractiveMap
            height='100%'
            fitBounds={bbox}
            layers={mapLayers}
            style={glStyle}
            map_id={featureLayer.layer_id}
            mapConfig={mapConfig}
            disableScrollZoom={false}
            title={featureLayer.name}
            hideInactive
            showTitle={false}
            showLegendLayersButton={false}
            gpxLink={gpxLink}
            locale={locale}
            primaryColor={process.env.NEXT_PUBLIC_PRIMARY_COLOR}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
            earthEngineClientID={process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID}
          />
        )
      }}
    </Subscribe>
  )
}
export default FeatureMap
