import React from 'react'
import Header from '../../../src/components/header'
import InteractiveMap from '../../../src/components/Map/InteractiveMap'
import { Provider } from 'unstated'
import BaseMapContainer from '../../../src/components/Map/containers/BaseMapContainer'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  layer: Record<string, any>
  locale: string
  headerConfig: Record<string, any>
  mapConfig: Record<string, any>
  user: Record<string, any>
}
export default class LayerMap extends React.Component<Props> {
  BaseMapState: BaseMapContainer
  static async getInitialProps({
    req,
    query
  }: {
    req: any
    query: Record<string, any>
  }): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  constructor(props: Props) {
    super(props)

    let baseMapContainerInit = {
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit = {
        baseMapOptions: props.mapConfig.baseMapOptions,
        bingKey: MAPHUBS_CONFIG.BING_KEY,
        tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
        mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
      }
    }

    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
  }

  render(): JSX.Element {
    const { t, props, BaseMapState } = this
    const { layer, headerConfig, mapConfig, locale } = props
    return (
      <ErrorBoundary t={t}>
        <Provider inject={[BaseMapState]}>
          <Header {...headerConfig} />
          <main
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
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
