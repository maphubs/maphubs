// @flow
import React from 'react'
import MiniLegend from '../components/Map/MiniLegend'
import Map from '../components/Map/Map'
import _debounce from 'lodash.debounce'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import BaseMapStore from '../stores/map/BaseMapStore'
import ErrorBoundary from '../components/ErrorBoundary'

const $ = require('jquery')

type Props = {
  name: LocalizedString,
  layers: Array<Object>,
  style: Object,
  position: Object,
  basemap: string,
  showLegend: boolean,
  showLogo: boolean,
  showScale: boolean,
  insetMap: boolean,
  locale: string,
  _csrf: string,
  settings: Object,
  mapConfig: Object
}

type State = {
  width: number,
  height: number
}

// A reponsive full window map used to render screenshots
export default class StaticMap extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    showLegend: true,
    showLogo: true,
    showScale: true,
    insetMap: true,
    settings: {}
  }

  state = {
    width: 1024,
    height: 600
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(BaseMapStore)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions})
    }
  }

  componentDidMount () {
    const _this = this

    function getSize () {
      return {
        width: Math.floor($(window).width()),
        height: $(window).height()
      }
    }

    this.setState(getSize())

    $(window).resize(function () {
      const debounced = _debounce(() => {
        _this.setState(getSize())
      }, 2500).bind(this)
      debounced()
    })
  }

  render () {
    let map, legend, bottomLegend
    const {name, layers, showLegend, position, settings} = this.props
    if (showLegend) {
      if (this.state.width < 600) {
        bottomLegend = (
          <MiniLegend
            style={{
              width: '100%'
            }}
            collapsible={false}
            title={name}
            hideInactive={false} showLayersButton={false}
            layers={layers} />
        )
      } else {
        legend = (
          <MiniLegend
            style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              minWidth: '275px',
              width: '25%'
            }}
            collapsible={false}
            title={name}
            hideInactive showLayersButton={false}
            layers={layers} />
        )
      }
    }

    let bounds
    if (typeof window === 'undefined' || !window.location.hash) {
      // only update position if there isn't absolute hash in the URL
      if (position && position.bbox) {
        const bbox = position.bbox
        bounds = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
      }
    }
    let insetConfig = {}
    if (settings && settings.insetConfig) {
      insetConfig = settings.insetConfig
    }
    insetConfig.collapsible = false

    map = (
      <Map ref='map'
        id='static-map'
        interactive={false}
        showPlayButton={false}
        fitBounds={bounds}
        insetMap={this.props.insetMap}
        insetConfig={insetConfig}
        showLogo={this.props.showLogo}
        showScale={this.props.showScale}
        style={{width: '100vw', height: '100vh'}}
        glStyle={this.props.style}
        mapConfig={this.props.mapConfig}
        baseMap={this.props.basemap} navPosition='top-right'>
        {legend}
      </Map>
    )

    return (
      <ErrorBoundary>
        <div className='embed-map'>
          {map}
          {bottomLegend}
        </div>
      </ErrorBoundary>
    )
  }
}
