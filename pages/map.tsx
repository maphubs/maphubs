import React from 'react'
import Header from '../src/components/header'
import MapMaker from '../src/components/MapMaker/MapMaker'
import slugify from 'slugify'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import '../services/locales'
import { Provider } from 'unstated'
import BaseMapContainer from '../src/components/Map/containers/BaseMapContainer'
import MapContainer from '../src/components/Map/containers/MapContainer'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
import type { Layer } from '../src/types/layer'
import type { Group } from '../src/stores/GroupStore'
import getConfig from 'next/config'
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
    Reflux.rehydrate(LocaleStore, {
      locale: props.locale,
      _csrf: props._csrf
    })

    if (props.user) {
      Reflux.rehydrate(UserStore, {
        user: props.user
      })
    }

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

  mapCreated: any | ((mapId: number, title: LocalizedString) => void) = (
    mapId: number,
    title: LocalizedString
  ) => {
    window.location = '/map/view/' + mapId + '/' + slugify(this.t(title))
  }

  render(): JSX.Element {
    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState, this.MapState]}>
          <Header activePage='map' {...this.props.headerConfig} />
          <main
            style={{
              height: 'calc(100% - 52px)',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <MapMaker
              mapConfig={this.props.mapConfig}
              onCreate={this.mapCreated}
              popularLayers={this.props.popularLayers}
              myLayers={this.props.myLayers}
              editLayer={this.props.editLayer}
              groups={this.props.groups}
            />
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
