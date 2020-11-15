// @flow
import type {Node} from "React";import React from 'react'
import Header from '../components/header'
import InteractiveMap from '../components/Map/InteractiveMap'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
  layer: Object,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object,
  user: Object
}

export default class LayerMap extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    let baseMapContainerInit = {bingKey: MAPHUBS_CONFIG.BING_KEY, tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY, mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit = {baseMapOptions: props.mapConfig.baseMapOptions, bingKey: MAPHUBS_CONFIG.BING_KEY, tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY, mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
  }

  render (): Node {
    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState]}>
          <Header {...this.props.headerConfig} />
          <main className='no-margin' style={{margin: 0, height: 'calc(100% - 50px)', width: '100%'}}>
            <InteractiveMap
              height='100%'
              fitBounds={this.props.layer.preview_position.bbox}
              style={this.props.layer.style}
              layers={[this.props.layer]}
              map_id={this.props.layer.layer_id}
              mapConfig={this.props.mapConfig}
              disableScrollZoom={false}
              title={this.props.layer.name}
              hideInactive={false}
              showTitle={false}
              primaryColor={MAPHUBS_CONFIG.primaryColor}
              logoSmall={MAPHUBS_CONFIG.logoSmall}
              logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
              logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
              mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
              DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
              earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
              t={this.t}
              locale={this.props.locale}
            />
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
