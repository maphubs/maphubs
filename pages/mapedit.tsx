import React from 'react'
import Header from '../src/components/header'
import MapMaker from '../src/components/MapMaker/MapMaker'
import slugify from 'slugify'
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
  map: Record<string, any>
  layers: Array<Layer>
  popularLayers: Array<Layer>
  myLayers: Array<Layer>
  groups: Array<Group>
  locale: string
  _csrf: string
  headerConfig: Record<string, any>
  mapConfig: Record<string, any>
  user: Record<string, any>
}
export default class MapEdit extends React.Component<Props> {
  BaseMapState: BaseMapContainer
  MapState: MapContainer
  t(title: LocalizedString): string {
    throw new Error('Method not implemented.')
  }
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
      baseMap: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
    } = {
      baseMap: props.map.basemap,
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

  mapCreated = (mapId: string, title: LocalizedString): void => {
    window.location.assign('/map/view/' + mapId + '/' + slugify(this.t(title)))
  }

  render(): JSX.Element {
    const { props, BaseMapState, MapState, mapCreated } = this
    const {
      headerConfig,
      mapConfig,
      layers,
      map,
      popularLayers,
      myLayers,
      groups
    } = props
    return (
      <ErrorBoundary t={t}>
        <Provider inject={[BaseMapState, MapState]}>
          <Header {...headerConfig} />
          <main
            style={{
              height: 'calc(100% - 52px)',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <MapMaker
              onCreate={mapCreated}
              mapConfig={mapConfig}
              mapLayers={layers}
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
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
