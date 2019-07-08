//  @flow
import React from 'react'
import { Subscribe } from 'unstated'
import MapHubsComponent from '../MapHubsComponent'
import InteractiveMap from '../Map/InteractiveMap'

import FRContainer from './containers/FRContainer'

type Props = {
  mapConfig: Object,
  gpxLink: Object
}

export default class FeatureMap extends MapHubsComponent<Props, void> {
  map: any

  frToggle = (id: string) => {
    if (id === 'remaining') {
      this.map.toggleVisibility(99999901)
    } else if (id === 'loss') {
      this.map.toggleVisibility(99999905)
    } else if (id === 'glad') {
      this.map.toggleVisibility(99999902)
    } else if (id === 'ifl') {
      this.map.toggleVisibility(99999903)
    } else if (id === 'iflloss') {
      this.map.toggleVisibility(99999904)
    }
  }

  render () {
    const {mapConfig, gpxLink} = this.props
    return (
      <Subscribe to={[FRContainer]}>
        {(FRState) => {
          const {mapLayers, glStyle, featureLayer, geoJSON} = FRState.state
          const bbox = geoJSON ? geoJSON.bbox : undefined
          return (
            <InteractiveMap
              ref={(el) => { this.map = el }}
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
              t={this.t}
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
}
