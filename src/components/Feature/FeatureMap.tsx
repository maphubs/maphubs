/* eslint-disable unicorn/numeric-separators-style */
import React, { useRef } from 'react'
import { Subscribe } from 'unstated'
import InteractiveMap from '../Map/InteractiveMap'
import FRContainer from './containers/FRContainer'
import getConfig from 'next/config'
import useT from '../../hooks/useT'

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  mapConfig: Record<string, any>
  gpxLink: Record<string, any>
}

const FeatureMap = ({ mapConfig, gpxLink }: Props): JSX.Element => {
  const map = useRef<InteractiveMap>()
  const { t, locale } = useT()
  const frToggle = (id: string): void => {
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
            ref={map}
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
            t={t}
            locale={locale}
            primaryColor={MAPHUBS_CONFIG.primaryColor}
            logoSmall={MAPHUBS_CONFIG.logoSmall}
            logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
            logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
            mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
            DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
            earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
          />
        )
      }}
    </Subscribe>
  )
}
export default FeatureMap
