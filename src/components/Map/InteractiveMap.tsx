import React from 'react'
// eslint-disable-next-line unicorn/import-index
import Map from './index'
import LayerList from './LayerList'
import MiniLegend from './MiniLegend'
import IsochroneLegendHelper from './IsochroneLegendHelper'
import { Drawer, Row } from 'antd'
import _debounce from 'lodash.debounce'
import _isEqual from 'lodash.isequal'
import findIndex from 'lodash.findindex'
import MapToolButton from './MapToolButton'
import ShareButtons from '../ShareButtons'
import MapStyles from './Styles'
import $ from 'jquery'
import type { Layer } from '../../types/layer'
import { LocalizedString } from '../../types/LocalizedString'
import { GLStyle } from '../../types/mapbox-gl-style'
type Props = {
  map_id: number
  title: LocalizedString
  style: Record<string, any>
  position?: Record<string, any>
  layers?: Array<Layer>
  height: string
  border: boolean
  showLogo: boolean
  disableScrollZoom: boolean
  showTitle: boolean
  categories?: Array<Record<string, any>>
  fitBounds: Array<number>
  fitBoundsOptions?: Record<string, any>
  interactive: boolean
  mapConfig: Record<string, any>
  insetConfig?: Record<string, any>
  showShareButtons: boolean
  hideInactive: boolean
  showScale: boolean
  showLegendLayersButton: boolean
  showMapTools: boolean
  showFeatureInfoEditButtons: boolean
  showFullScreen: boolean
  insetMap: boolean
  children?: any
  basemap: string
  gpxLink?: Record<string, any>
  hash?: boolean
  preserveDrawingBuffer?: boolean
  t: (...args: Array<any>) => any
  primaryColor: string
  logoSmall?: string
  logoSmallWidth?: number
  logoSmallHeight?: number
  locale: string
  mapboxAccessToken: string
  DGWMSConnectID?: string
  earthEngineClientID?: string
  showLayerVisibility: boolean
  showLayerInfo: boolean
  showPlayButton: boolean
  showSearch: boolean
  onLoad?: (...args: Array<any>) => void
}
type State = {
  width?: number
  height?: number
  style: Record<string, any>
  position?: Record<string, any>
  layers?: Array<Layer>
  basemap: string
  mapLayersListOpen?: boolean
  mobileMapLegendOpen?: boolean
}
export default class InteractiveMap extends React.Component<Props, State> {
  static defaultProps: {
    basemap: string
    border: boolean
    disableScrollZoom: boolean
    height: string
    hideInactive: boolean
    insetMap: boolean
    interactive: boolean
    preserveDrawingBuffer: boolean
    primaryColor: string
    showFeatureInfoEditButtons: boolean
    showFullScreen: boolean
    showLayerInfo: boolean
    showLayerVisibility: boolean
    showLegendLayersButton: boolean
    showLogo: boolean
    showMapTools: boolean
    showPlayButton: boolean
    showScale: boolean
    showSearch: boolean
    showShareButtons: boolean
    showTitle: boolean
  } = {
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
    primaryColor: 'black',
    showLayerVisibility: true,
    // show toggles in layer menu
    showLayerInfo: true,
    // show info links in layer menu
    showPlayButton: true,
    showMapTools: true,
    showFeatureInfoEditButtons: true,
    showSearch: true,
    showFullScreen: true
  }
  mobileMapLegend: any
  mapLayersList: any

  constructor(props: Props) {
    super(props)
    this.state = {
      style: props.style,
      position: props.position,
      basemap: props.basemap,
      layers: props.layers
    }
  }

  componentDidMount(): void {
    const _this = this

    if (typeof window === 'undefined') return // only run this on the client

    function getSize() {
      // Get the dimensions of the viewport
      const width = Math.floor($(window).width())
      const height = $(window).height()
      return {
        width,
        height
      }
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
      }, 2500)

      debounced()
    })
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.layers && !_isEqual(nextProps.layers, this.props.layers)) {
      this.updateLayers(nextProps.layers, true)
    }
  }

  toggleVisibility: (layer_id: number) => void = (layer_id: number) => {
    const mapLayers = this.state.layers
    const index = findIndex(mapLayers, {
      layer_id
    })
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

      if (layer.style?.layers) {
        for (const styleLayer of layer.style.layers) {
          if (!styleLayer.layout) {
            styleLayer.layout = {}
          }

          const markerSettings = MapStyles.settings.get(styleLayer, 'markers')

          styleLayer.layout.visibility =
            active && !markerSettings?.enabled ? 'visible' : 'none'
        }
      }

      this.updateMap(mapLayers)
    }
  }
  updateMap: (layers: Array<Layer>) => void = (layers: Array<Layer>) => {
    // treat as immutable and clone
    layers = JSON.parse(JSON.stringify(layers))
    const style = this.buildMapStyle(layers)
    this.setState({
      layers,
      style
    })
  }
  updateLayers: (layers: Array<Layer>, update?: boolean) => void = (
    layers: Array<Layer>,
    update = true
  ) => {
    this.setState({
      layers
    })

    if (update) {
      this.updateMap(layers)
    }
  }
  buildMapStyle = (layers: Array<Layer>): GLStyle => {
    return MapStyles.style.buildMapStyle(layers)
  }
  onToggleIsochroneLayer: (enabled: boolean) => void = (enabled: boolean) => {
    let mapLayers = []

    if (this.state.layers) {
      mapLayers = this.state.layers
    }

    const layers = IsochroneLegendHelper.getLegendLayers()

    if (enabled) {
      // add layers to legend
      mapLayers = [...mapLayers, ...layers]
    } else {
      const updatedLayers = []
      // remove layers from legend
      for (const mapLayer of mapLayers) {
        let foundInLayers
        for (const layer of layers) {
          if (mapLayer.layer_id === layer.layer_id) {
            foundInLayers = true
          }
        }

        if (!foundInLayers) {
          updatedLayers.push(mapLayer)
        }
      }
      mapLayers = updatedLayers
    }

    this.updateLayers(mapLayers, false)
  }
  onSetOpenMobileMapLegend: (mobileMapLegendOpen: boolean) => void = (
    mobileMapLegendOpen: boolean
  ) => {
    this.setState({
      mobileMapLegendOpen
    })
  }
  onSetOpenMapLayersList: (mapLayersListOpen: boolean) => void = (
    mapLayersListOpen: boolean
  ) => {
    this.setState({
      mapLayersListOpen
    })
  }

  render(): JSX.Element {
    const {
      fitBounds,
      showShareButtons,
      t,
      primaryColor,
      logoSmall,
      logoSmallHeight,
      logoSmallWidth,
      hash,
      showLayerVisibility,
      showLayerInfo,
      showPlayButton,
      showFeatureInfoEditButtons,
      showMapTools,
      showSearch,
      showFullScreen,
      showTitle,
      categories,
      insetMap,
      hideInactive,
      showLegendLayersButton,
      interactive,
      map_id,
      fitBoundsOptions,
      showLogo,
      insetConfig,
      mapConfig,
      showScale,
      disableScrollZoom,
      gpxLink,
      preserveDrawingBuffer,
      locale,
      mapboxAccessToken,
      DGWMSConnectID,
      earthEngineClientID,
      onLoad
    } = this.props
    const {
      position,
      width,
      layers,
      style,
      mobileMapLegendOpen,
      mapLayersListOpen
    } = this.state
    let border = 'none'

    if (this.props.border) {
      border = '1px solid #323333'
    }

    let bounds

    if (fitBounds) {
      bounds = fitBounds
    } else if (
      position &&
      (typeof window === 'undefined' || !window.location.hash) && // only update position if there isn't absolute hash in the URL
      position.bbox
    ) {
      const bbox = position.bbox
      bounds = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
    }

    const children = this.props.children || ''
    const title = showTitle ? this.props.title : undefined
    let height = '100%'
    let topOffset = 0

    if (categories) {
      topOffset = 35
      height = 'calc(100% - 35px)'
    }

    let legend = <></>

    if (!width || width >= 600) {
      let insetOffset = 185

      if (!insetMap) {
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
            width: '20%',
            zIndex: 2
          }}
          maxHeight={`calc(${this.props.height} - ${legendMaxHeight}px)`}
          hideInactive={hideInactive}
          showLayersButton={showLegendLayersButton}
          layers={layers}
          title={title}
          collapsible={interactive}
          openLayersPanel={() => {
            this.onSetOpenMapLayersList(true)
          }}
        />
      )
    }

    const mobileLegendButtonTop = `${10 + topOffset}px`
    return (
      <div
        style={{
          width: '100%',
          height: `calc(${this.props.height} - 0px)`,
          overflow: 'hidden',
          border,
          position: 'relative'
        }}
      >
        {width && width < 600 && (
          <MapToolButton
            onClick={() => this.onSetOpenMobileMapLegend(true)}
            top={mobileLegendButtonTop}
            left='10px'
            color={primaryColor}
            icon='info'
          />
        )}
        <Map
          id={'map-' + map_id}
          fitBounds={bounds}
          fitBoundsOptions={fitBoundsOptions}
          height={this.props.height}
          interactive={interactive}
          style={{
            width: '100%',
            height
          }}
          glStyle={style}
          onToggleIsochroneLayer={this.onToggleIsochroneLayer}
          showLogo={showLogo}
          mapConfig={mapConfig}
          insetConfig={insetConfig}
          insetMap={insetMap}
          showScale={showScale}
          disableScrollZoom={disableScrollZoom}
          gpxLink={gpxLink}
          preserveDrawingBuffer={preserveDrawingBuffer}
          logoSmall={logoSmall}
          logoSmallHeight={logoSmallHeight}
          logoSmallWidth={logoSmallWidth}
          hash={hash}
          t={t}
          locale={locale}
          mapboxAccessToken={mapboxAccessToken}
          DGWMSConnectID={DGWMSConnectID}
          earthEngineClientID={earthEngineClientID}
          categories={categories}
          mapLayers={layers}
          toggleVisibility={this.toggleVisibility}
          onLoad={onLoad}
          showPlayButton={showPlayButton}
          showMapTools={showMapTools}
          showFeatureInfoEditButtons={showFeatureInfoEditButtons}
          showSearch={showSearch}
          showFullScreen={showFullScreen}
        >
          {legend}
          <div
            ref={(el) => {
              this.mobileMapLegend = el
            }}
          />
          <Drawer
            getContainer={() => this.mobileMapLegend}
            visible={mobileMapLegendOpen}
            onClose={() => {
              this.onSetOpenMobileMapLegend(false)
            }}
            placement='left'
            bodyStyle={{
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: '50px'
            }}
            width='240px'
          >
            {width && width < 600 && (
              <MiniLegend
                t={t}
                style={{
                  width: '100%'
                }}
                title={title}
                collapsible={false}
                hideInactive={hideInactive}
                showLayersButton={false}
                layers={layers}
              />
            )}
          </Drawer>
          <div
            ref={(el) => {
              this.mapLayersList = el
            }}
          />
          <Drawer
            getContainer={() => this.mapLayersList}
            title={t('Map Layers')}
            visible={mapLayersListOpen}
            onClose={() => {
              this.onSetOpenMapLayersList(false)
            }}
            placement='right'
            bodyStyle={{
              padding: 0
            }}
            width='240px'
          >
            <Row
              style={{
                height: '100%'
              }}
            >
              <LayerList
                layers={layers}
                showDesign={false}
                showRemove={false}
                showVisibility={showLayerVisibility}
                showInfo={showLayerInfo}
                toggleVisibility={this.toggleVisibility}
                updateLayers={this.updateLayers}
                t={t}
              />
            </Row>
          </Drawer>
          {children}
          {showShareButtons && (
            <ShareButtons
              title={this.props.title}
              iconSize={20}
              t={t}
              style={{
                position: 'absolute',
                bottom: '40px',
                right: '4px',
                zIndex: '1'
              }}
            />
          )}
        </Map>
      </div>
    )
  }
}
