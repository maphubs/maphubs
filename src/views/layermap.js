// @flow
import React from 'react'
import Header from '../components/header'
import InteractiveMap from '../components/InteractiveMap'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

type Props = {
  layer: Object,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object,
  user: Object
}

export default class LayerMap extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      this.BaseMapState = new BaseMapContainer({baseMapOptions: props.mapConfig.baseMapOptions})
    }
  }

  render () {
    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState]}>
          <Header {...this.props.headerConfig} />
          <main className='no-margin' style={{margin: 0, height: 'calc(100% - 50px)', width: '100%'}}>
            <InteractiveMap
              ref='interactiveMap'
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
            />
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
