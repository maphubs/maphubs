// @flow
import React from 'react'
import Header from '../components/header'
import MapMaker from '../components/MapMaker/MapMaker'
import slugify from 'slugify'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import BaseMapStore from '../stores/map/BaseMapStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

type Props = {
  popularLayers: Array<Object>,
  myLayers: Array<Object>,
  editLayer: Object,
  headerConfig: Object,
  mapConfig: Object,
  locale: string,
  _csrf: string,
  user: Object
}

type DefaultProps = {
  popularLayers: Array<Object>,
  myLayers: Array<Object>
}

export default class Map extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps: DefaultProps = {
    popularLayers: [],
    myLayers: []
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(BaseMapStore)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions})
    }
  }

  mapCreated = (mapId: number, title: LocalizedString) => {
    window.location = '/map/view/' + mapId + '/' + slugify(this._o_(title))
  }

  render () {
    return (
      <ErrorBoundary>
        <div>
          <Header activePage='map' {...this.props.headerConfig} />
          <main style={{height: 'calc(100% - 52px)', overflow: 'hidden'}}>
            <MapMaker
              mapConfig={this.props.mapConfig}
              onCreate={this.mapCreated}
              popularLayers={this.props.popularLayers}
              myLayers={this.props.myLayers}
              editLayer={this.props.editLayer}
            />
          </main>
        </div>
      </ErrorBoundary>
    )
  }
}
