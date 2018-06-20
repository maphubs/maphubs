// @flow
import React from 'react'

import Map from './Map/Map'
import LayerList from './MapMaker/LayerList'
import MiniLegend from './Map/MiniLegend'
import MapStore from '../stores/MapStore'
import MapActions from '../actions/MapActions'
import ForestLossLegendHelper from './Map/ForestLossLegendHelper'
import IsochroneLegendHelper from './Map/IsochroneLegendHelper'
import MapLayerMenu from './InteractiveMap/MapLayerMenu'
import MapHubsComponent from './MapHubsComponent'
import Reflux from './Rehydrate'
import _debounce from 'lodash.debounce'
import _isEqual from 'lodash.isequal'
import ShareButtons from './ShareButtons'

import type {MapStoreState} from '../stores/MapStore'

// var debug = require('../../services/debug')('CreateMap');
import $ from 'jquery'

type Props = {
  map_id: number,
  title: LocalizedString,
  style: Object,
  position?: Object,
  layers?: Array<Object>,
  height: string,
  border: boolean,
  showLogo: boolean,
  disableScrollZoom: boolean,
  showTitle: boolean,
  categories?: Array<Object>,
  fitBounds: Array<number>,
  fitBoundsOptions?: Object,
  interactive: boolean,
  mapConfig: Object,
  insetConfig?: Object,
  showShareButtons: boolean,
  hideInactive: boolean,
  showScale: boolean,
  showLegendLayersButton: boolean,
  insetMap: boolean,
  children?: any,
  basemap: string,
  gpxLink?: Object,
  preserveDrawingBuffer?: boolean
}

type State = {
  width: number,
  height: number
} & MapStoreState

export default class InteractiveMap extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    height: '300px',
    basemap: 'default',
    border: false,
    disableScrollZoom: true,
    showLogo: true,
    showTitle: true,
    interactive: true,
    showShareButtons: true,
    hideInactive: true,
    showScale: true,
    insetMap: true,
    showLegendLayersButton: true,
    preserveDrawingBuffer: false
  }

  state: State
  map: any
  mapLegendSideNav: any
  mapLayersSideNav: any

  constructor (props: Props) {
    super(props)
    this.stores.push(MapStore)
    Reflux.rehydrate(MapStore, {style: this.props.style, position: this.props.position, basemap: this.props.basemap, layers: this.props.layers})
  }

  componentWillMount () {
    super.componentWillMount()
    const _this = this
    if (typeof window === 'undefined') return // only run this on the client

    function getSize () {
      // Get the dimensions of the viewport
      const width = Math.floor($(window).width())
      const height = $(window).height()
      return {width, height}
    }

    const size = getSize()
    this.setState({
      width: size.width,
      height: size.height
    })

    $(window).resize(function () {
      const debounced = _debounce(() => {
        const size = getSize()
        _this.setState({
          width: size.width,
          height: size.height
        })
      }, 2500).bind(this)
      debounced()
    })
  }

  componentDidMount () {
    M.Sidenav.init(this.mapLegendSideNav, {edge: 'left'})
    M.Sidenav.init(this.mapLayersSideNav, {edge: 'left'})
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!_isEqual(nextProps.layers, this.props.layers)) {
      MapActions.updateLayers(nextProps.layers, true)
    }
  }

  toggleVisibility = (layer_id: number) => {
    MapActions.toggleVisibility(layer_id, (layerStyle) => {
      // _this.refs.map.updateLayer(layerStyle);
    })
  }

  onToggleForestLoss = (enabled: boolean) => {
    let mapLayers = []
    if (this.state.layers) {
      mapLayers = this.state.layers
    }
    const layers = ForestLossLegendHelper.getLegendLayers()

    if (enabled) {
      // add layers to legend
      mapLayers = mapLayers.concat(layers)
    } else {
      const updatedLayers = []
      // remove layers from legend
      mapLayers.forEach(mapLayer => {
        let foundInLayers
        layers.forEach(layer => {
          if (mapLayer.id === layer.id) {
            foundInLayers = true
          }
        })
        if (!foundInLayers) {
          updatedLayers.push(mapLayer)
        }
      })
      mapLayers = updatedLayers
    }
    MapActions.updateLayers(mapLayers, false)
  }

  onToggleIsochroneLayer = (enabled: boolean) => {
    let mapLayers = []
    if (this.state.layers) {
      mapLayers = this.state.layers
    }
    const layers = IsochroneLegendHelper.getLegendLayers()

    if (enabled) {
      // add layers to legend
      mapLayers = mapLayers.concat(layers)
    } else {
      const updatedLayers = []
      // remove layers from legend
      mapLayers.forEach(mapLayer => {
        let foundInLayers
        layers.forEach(layer => {
          if (mapLayer.id === layer.id) {
            foundInLayers = true
          }
        })
        if (!foundInLayers) {
          updatedLayers.push(mapLayer)
        }
      })
      mapLayers = updatedLayers
    }
    MapActions.updateLayers(mapLayers, false)
  }

  openLayersPanel = () => {
    let instance = M.Sidenav.getInstance(this.mapLayersSideNav)
    if (!instance) {
      M.Sidenav.init(this.mapLayersSideNav, {edge: 'left'})
      instance = M.Sidenav.getInstance(this.mapLayersSideNav)
    }
    instance.open()
  }

  closeLayersPanel = () => {
    let instance = M.Sidenav.getInstance(this.mapLayersSideNav)
    if (instance) {
      instance.close()
    }
  }

  getMap = () => {
    return this.map
  }
  render () {
    const {fitBounds} = this.props
    const {position} = this.state
    let border = 'none'
    if (this.props.border) {
      border = '1px solid #212121'
    }

    let bounds
    if (fitBounds) {
      bounds = fitBounds
    } else if (position) {
      if (typeof window === 'undefined' || !window.location.hash) {
        // only update position if there isn't absolute hash in the URL
        if (position && position.bbox) {
          const bbox = position.bbox
          bounds = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
        }
      }
    }

    let children = ''
    if (this.props.children) {
      children = this.props.children
    }

    let title
    if (this.props.showTitle && this.props.title) {
      title = this.props.title
    }

    let categoryMenu = ''
    let height = '100%'
    let topOffset = 0
    if (this.props.categories) {
      categoryMenu = (
        <MapLayerMenu categories={this.props.categories}
          toggleVisibility={this.toggleVisibility}
          layers={this.state.layers} />
      )
      topOffset = 35
      height = 'calc(100% - 35px)'
    }

    let legend = ''
    let mobileLegend = ''
    if (this.state.width < 600) {
      mobileLegend = (
        <MiniLegend
          style={{
            width: '100%'
          }}
          title={title}
          collapsible={false}
          hideInactive={this.props.hideInactive}
          showLayersButton={this.props.showLegendLayersButton}
          mapLayersActivatesID={`map-layers-${this.props.map_id}`}
          layers={this.state.layers}
        />
      )
    } else {
      let insetOffset = 185
      if (!this.props.insetMap) {
        insetOffset = 30
      }
      const legendMaxHeight = topOffset + insetOffset
      legend = (
        <MiniLegend
          style={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            minWidth: '200px',
            width: '20%'
          }}
          maxHeight={`calc(${this.props.height} - ${legendMaxHeight}px)`}
          hideInactive={this.props.hideInactive}
          showLayersButton={this.props.showLegendLayersButton}
          layers={this.state.layers}
          title={title}
          openLayersPanel={this.openLayersPanel}
          mapLayersActivatesID={`map-layers-${this.props.map_id}`} />
      )
    }

    let shareButtons = ''

    if (this.props.showShareButtons) {
      shareButtons = (
        <ShareButtons title={this.props.title} iconSize={24}
          style={{position: 'absolute', bottom: '5px', left: '155px', zIndex: '1'}} />
      )
    }

    const mobileLegendButtonTop = `${10 + topOffset}px`

    return (
      <div style={{width: '100%', height: `calc(${this.props.height} - 0px)`, overflow: 'hidden', border, position: 'relative'}}>

        <a href='#'
          className='button-collapse hide-on-med-and-up sidenav-trigger'
          data-target={`mobile-map-legend-${this.props.map_id}`}
          style={{position: 'absolute',
            top: mobileLegendButtonTop,
            left: '10px',
            height: '30px',
            lineHeight: '30px',
            zIndex: 1,
            textAlign: 'center',
            width: '30px'}}
        >
          <i className='material-icons z-depth-1'
            style={{height: '30px',
              lineHeight: '30px',
              width: '30px',
              color: MAPHUBS_CONFIG.primaryColor,
              borderRadius: '4px',
              backgroundColor: 'white',
              borderColor: '#ddd',
              borderStyle: 'solid',
              borderWidth: '1px',
              fontSize: '25px'}}
          >info</i>
        </a>

        {categoryMenu}

        <Map ref={(el) => { this.map = el }} id={'map-' + this.props.map_id}
          fitBounds={bounds} fitBoundsOptions={this.props.fitBoundsOptions}
          height={this.props.height}
          interactive={this.props.interactive}
          style={{width: '100%', height}}
          glStyle={this.state.style}
          baseMap={this.props.basemap}
          onToggleForestLoss={this.onToggleForestLoss}
          onToggleIsochroneLayer={this.onToggleIsochroneLayer}
          showLogo={this.props.showLogo}
          mapConfig={this.props.mapConfig}
          insetConfig={this.props.insetConfig}
          insetMap={this.props.insetMap}
          showScale={this.props.showScale}
          disableScrollZoom={this.props.disableScrollZoom}
          gpxLink={this.props.gpxLink}
          preserveDrawingBuffer={this.props.preserveDrawingBuffer}
        >

          {legend}
          <div ref={(el) => { this.mapLegendSideNav = el }} className='sidenav' id={`mobile-map-legend-${this.props.map_id}`}
            style={{
              height: '100%',
              position: 'absolute',
              width: '240px',
              paddingBottom: '0'
            }}>
            {mobileLegend}
          </div>

          <div ref={(el) => { this.mapLayersSideNav = el }} className='sidenav' id={`map-layers-${this.props.map_id}`}
            style={{
              height: '100%',
              position: 'absolute',
              width: '260px',
              paddingBottom: '0',
              paddingTop: '25px'
            }}>
            <a className='omh-color' style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}} onClick={this.closeLayersPanel}>
              <i className='material-icons selected-feature-close' style={{fontSize: '20px'}}>close</i>
            </a>
            <LayerList layers={this.state.layers}
              showDesign={false} showRemove={false} showVisibility
              toggleVisibility={this.toggleVisibility}
              updateLayers={MapActions.updateLayers}
            />
          </div>
          {children}
          {shareButtons}
        </Map>

      </div>
    )
  }
}
