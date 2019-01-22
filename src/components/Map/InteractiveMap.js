// @flow
import React from 'react'

// eslint-disable-next-line unicorn/import-index
import Map from './index'
import LayerList from './LayerList'
import MiniLegend from './MiniLegend'
import IsochroneLegendHelper from './IsochroneLegendHelper'
import MapLayerMenu from './MapLayerMenu'
import Drawer from 'rc-drawer'
import _debounce from 'lodash.debounce'
import _isEqual from 'lodash.isequal'
import findIndex from 'lodash.findindex'
import Close from '@material-ui/icons/Close'
import MapToolButton from './MapToolButton'
import ShareButtons from '../ShareButtons'
import MapStyles from './Styles'
import $ from 'jquery'

import type {Layer} from '../../types/layer'

type Props = {
  map_id: number,
  title: LocalizedString,
  style: Object,
  position?: Object,
  layers?: Array<Layer>,
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
  preserveDrawingBuffer?: boolean,
  t: Function,
  primaryColor: string,
  logoSmall?: string,
  logoSmallWidth?: number,
  logoSmallHeight?: number
}

type State = {
  width?: number,
  height?: number,
  style: Object,
  position?: Object,
  layers?: Array<Layer>,
  basemap: string,
  mapLayersListOpen?: boolean,
  mobileMapLegendOpen?: boolean
}

export default class InteractiveMap extends React.Component<Props, State> {
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
    preserveDrawingBuffer: false,
    primaryColor: 'black'
  }

  mobileMapLegend: any
  mapLayersList: any

  constructor (props: Props) {
    super(props)
    this.state = {
      style: props.style,
      position: props.position,
      basemap: props.basemap,
      layers: props.layers
    }
  }

  componentWillMount () {
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

  componentWillReceiveProps (nextProps: Props) {
    if (nextProps.layers && !_isEqual(nextProps.layers, this.props.layers)) {
      this.updateLayers(nextProps.layers, true)
    }
  }

  toggleVisibility = (layer_id: number) => {
    const mapLayers = this.state.layers
    const index = findIndex(mapLayers, {layer_id})
    let layer
    if (mapLayers) {
      layer = mapLayers[index]
      let active = MapStyles.settings.get(layer.style, 'active')

      if (active) {
        layer.style = MapStyles.settings.set(layer.style, 'active', false)
        active = false
      } else {
        layer.style = MapStyles.settings.set(layer.style, 'active', true)
        active = true
      }

      if (layer && layer.style && layer.style.layers) {
        layer.style.layers.forEach((styleLayer) => {
          if (!styleLayer.layout) {
            styleLayer.layout = {}
          }
          if (active) {
            styleLayer.layout.visibility = 'visible'
          } else {
            styleLayer.layout.visibility = 'none'
          }
        })
      }

      this.updateMap(mapLayers)
    }
  }

  updateMap = (layers: Array<Layer>) => {
    // treat as immutable and clone
    layers = JSON.parse(JSON.stringify(layers))
    const style = this.buildMapStyle(layers)
    this.setState({layers, style})
  }

  updateLayers = (layers: Array<Layer>, update: boolean = true) => {
    this.setState({layers})
    if (update) {
      this.updateMap(layers)
    }
  }

  buildMapStyle = (layers: Array<Layer>) => {
    return MapStyles.style.buildMapStyle(layers)
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
          if (mapLayer.layer_id === layer.layer_id) {
            foundInLayers = true
          }
        })
        if (!foundInLayers) {
          updatedLayers.push(mapLayer)
        }
      })
      mapLayers = updatedLayers
    }
    this.updateLayers(mapLayers, false)
  }

  onSetOpenMobileMapLegend = (mobileMapLegendOpen: boolean) => {
    this.setState({ mobileMapLegendOpen })
  }

  onSetOpenMapLayersList = (mapLayersListOpen: boolean) => {
    this.setState({ mapLayersListOpen })
  }

  render () {
    const {fitBounds, showShareButtons, t, primaryColor, logoSmall, logoSmallHeight, logoSmallWidth} = this.props
    const {position, width} = this.state
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

    let children = this.props.children || ''

    let title = this.props.showTitle ? this.props.title : undefined

    let height = '100%'
    let topOffset = 0
    if (this.props.categories) {
      topOffset = 35
      height = 'calc(100% - 35px)'
    }

    let legend = ''
    if (!width || width >= 600) {
      let insetOffset = 185
      if (!this.props.insetMap) {
        insetOffset = 30
      }
      const legendMaxHeight = topOffset + insetOffset
      legend = (
        <MiniLegend
          t={t}
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
          openLayersPanel={() => { this.onSetOpenMapLayersList(true) }}
        />
      )
    }

    const mobileLegendButtonTop = `${10 + topOffset}px`

    return (
      <div style={{width: '100%', height: `calc(${this.props.height} - 0px)`, overflow: 'hidden', border, position: 'relative'}}>
        {(width && width < 600) &&
          <MapToolButton
            onClick={() => this.onSetOpenMobileMapLegend(true)}
            top={mobileLegendButtonTop}
            left='10px'
            color={primaryColor}
            icon='info'
          />
        }

        {this.props.categories &&
          <MapLayerMenu categories={this.props.categories}
            toggleVisibility={this.toggleVisibility}
            layers={this.state.layers} t={t} />
        }

        <Map id={'map-' + this.props.map_id}
          fitBounds={bounds} fitBoundsOptions={this.props.fitBoundsOptions}
          height={this.props.height}
          interactive={this.props.interactive}
          style={{width: '100%', height}}
          glStyle={this.state.style}
          baseMap={this.props.basemap}
          onToggleIsochroneLayer={this.onToggleIsochroneLayer}
          showLogo={this.props.showLogo}
          mapConfig={this.props.mapConfig}
          insetConfig={this.props.insetConfig}
          insetMap={this.props.insetMap}
          showScale={this.props.showScale}
          disableScrollZoom={this.props.disableScrollZoom}
          gpxLink={this.props.gpxLink}
          preserveDrawingBuffer={this.props.preserveDrawingBuffer}
          logoSmall={logoSmall}
          logoSmallHeight={logoSmallHeight}
          logoSmallWidth={logoSmallWidth}
          t={t}
        >
          {legend}

          <div ref={(el) => { this.mobileMapLegend = el }} />
          <Drawer
            getContainer={() => this.mobileMapLegend}
            open={this.state.mobileMapLegendOpen}
            onMaskClick={() => { this.onSetOpenMobileMapLegend(false) }}
            handler={false}
            level={null}
            placement='left'
            width='240px'
          >
            {(width && width < 600) &&
              <MiniLegend
                t={t}
                style={{
                  width: '100%'
                }}
                title={title}
                collapsible={false}
                hideInactive={this.props.hideInactive}
                showLayersButton={false}
                layers={this.state.layers}
              />
            }
          </Drawer>

          <div ref={(el) => { this.mapLayersList = el }} />
          <Drawer
            getContainer={() => this.mapLayersList}
            open={this.state.mapLayersListOpen}
            onMaskClick={() => { this.onSetOpenMapLayersList(false) }}
            handler={false}
            level={null}
            placement='right'
            width='240px'
          >
            <a className='omh-color'
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                cursor: 'pointer',
                zIndex: 99,
                height: '20px'
              }}
              onClick={() => { this.onSetOpenMapLayersList(false) }}
            >
              <Close style={{fontSize: '20px', color: 'white'}} />
            </a>
            <div style={{height: '100%'}}>
              <p style={{padding: '2px', marginBottom: 0, fontSize: '14px', fontWeight: 'bold'}}>{t('Map Layers')}</p>
              <div style={{height: 'calc(100% - 25px)'}}>
                <LayerList layers={this.state.layers}
                  showDesign={false} showRemove={false} showVisibility
                  toggleVisibility={this.toggleVisibility}
                  updateLayers={this.updateLayers}
                  t={t}
                />
              </div>
            </div>
          </Drawer>
          {children}
          {showShareButtons &&
            <ShareButtons title={this.props.title} iconSize={24} t={t}
              style={{position: 'absolute', bottom: '5px', left: '155px', zIndex: '1'}} />
          }
        </Map>
      </div>
    )
  }
}
