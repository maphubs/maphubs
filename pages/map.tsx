import React from 'react'
import Header from '../src/components/header'
import MapMaker from '../src/components/MapMaker/MapMaker'
import slugify from 'slugify'
import '../services/locales'
import { Provider } from 'unstated'
import BaseMapContainer from '../src/components/Map/containers/BaseMapContainer'
import MapContainer from '../src/components/Map/containers/MapContainer'
import ErrorBoundary from '../src/components/ErrorBoundary'
import type { Layer } from '../src/types/layer'
import type { Group } from '../src/stores/GroupStore'
import getConfig from 'next/config'
import { LocalizedString } from '../src/types/LocalizedString'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  popularLayers: Array<Layer>
  myLayers: Array<Layer>
  groups: Array<Group>
  editLayer: Record<string, any>
  headerConfig: Record<string, any>
  mapConfig: Record<string, any>
  locale: string
  _csrf: string
  user: Record<string, any>
}
export default class Map extends React.Component<Props> {
  BaseMapState: any
  MapState: any
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

  static defaultProps:
    | any
    | {
        myLayers: Array<any>
        popularLayers: Array<any>
      } = {
    popularLayers: [],
    myLayers: []
  }

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

  mapCreated = (mapId: number, title: LocalizedString): void => {
    window.location.assign('/map/view/' + mapId + '/' + slugify(this.t(title)))
  }

  render(): JSX.Element {
    const { props, BaseMapState, MapState, mapCreated } = this
    const {
      headerConfig,
      mapConfig,
      popularLayers,
      myLayers,
      editLayer,
      groups
    } = props
    return (
      <ErrorBoundary t={t}>
        <Provider inject={[BaseMapState, MapState]}>
          <Header activePage='map' {...headerConfig} />
          <main
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
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
