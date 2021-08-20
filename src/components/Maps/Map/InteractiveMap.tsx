import React, { useState, useEffect, useRef } from 'react'
// eslint-disable-next-line unicorn/import-index
import Map from './index'
import LayerList from './LayerList'
import MiniLegend from './MiniLegend'
import { Drawer, Row } from 'antd'
import _isEqual from 'lodash.isequal'
import MapToolButton from './MapToolButton'
import ShareButtons from '../../ShareButtons'
import MapStyles from './Styles'
import type { Layer } from '../../../types/layer'
import { LocalizedString } from '../../../types/LocalizedString'
import mapboxgl, {
  CircleLayer,
  FillLayer,
  LineLayer,
  RasterLayer
} from 'mapbox-gl'
import AutoSizer from 'react-virtualized-auto-sizer'
import useMapT from '../hooks/useMapT'

type Props = {
  map_id: number
  title: LocalizedString
  style: mapboxgl.Style
  position?: Record<string, any>
  layers?: Array<Layer>
  height: string
  border?: boolean
  showLogo?: boolean
  disableScrollZoom?: boolean
  showTitle?: boolean
  categories?: Array<Record<string, any>>
  fitBounds?: Array<number>
  fitBoundsOptions?: Record<string, any>
  interactive?: boolean
  mapConfig: Record<string, any>
  insetConfig?: Record<string, any>
  showShareButtons?: boolean
  hideInactive?: boolean
  showScale?: boolean
  showLegendLayersButton?: boolean
  showMapTools?: boolean
  showFeatureInfoEditButtons?: boolean
  showFullScreen?: boolean
  insetMap?: boolean
  children?: any
  basemap?: string
  gpxLink?: string
  hash?: boolean
  preserveDrawingBuffer?: boolean
  primaryColor: string
  locale: string
  mapboxAccessToken: string
  DGWMSConnectID?: string
  earthEngineClientID?: string
  showLayerVisibility?: boolean
  showLayerInfo?: boolean
  showPlayButton?: boolean
  showSearch?: boolean
  onLoad?: (...args: Array<any>) => void
}
type State = {
  width?: number
  height?: number
  style: Record<string, any>
  position?: Record<string, any>
  layers?: Array<Layer>
  basemap: string
}
const InteractiveMap = (props: Props): JSX.Element => {
  const { t } = useMapT()
  const mobileMapLegend = useRef()
  const mapLayersList = useRef()
  const [style, setStyle] = useState(props.style)
  const [position, setPosition] = useState(props.position)
  const [baseMap, setBaseMap] = useState(props.basemap)
  const [layers, setLayers] = useState<Layer[]>(props.layers || [])
  const [mobileMapLegendOpen, setMobileMapLegendOpen] = useState(false)
  const [mapLayersListOpen, setMapLayersListOpen] = useState(false)

  //? do we still need to support changing the intital layers from props?
  const prevLayers = useRef<Layer[]>()
  useEffect(() => {
    if (
      !prevLayers.current || // first time we've seen layer props
      !_isEqual(props.layers, prevLayers.current) // or layers from props have changed
    ) {
      setLayers(props.layers)
      prevLayers.current = props.layers
    }
  }, [props.layers])

  const toggleVisibility = (layer_id: number) => {
    const layer = layers.find((layer) => layer.layer_id === layer_id)

    let active = MapStyles.settings.get(layer.style, 'active')

    if (active) {
      layer.style = MapStyles.settings.set(layer.style, 'active', false)
      active = false
    } else {
      layer.style = MapStyles.settings.set(layer.style, 'active', true)
      active = true
    }

    if (layer.style?.layers) {
      for (const styleLayer of layer.style.layers as Array<
        LineLayer | FillLayer | CircleLayer | RasterLayer
      >) {
        if (!styleLayer.layout) {
          styleLayer.layout = {}
        }

        const markerSettings = MapStyles.settings.get(styleLayer, 'markers')

        styleLayer.layout.visibility =
          active && !markerSettings?.enabled ? 'visible' : 'none'
      }
    }
    updateMap(layers)
  }
  const updateMap = (layersUpdate: Array<Layer>) => {
    // treat as immutable and clone
    const layersUpdateClone = JSON.parse(JSON.stringify(layersUpdate))
    setLayers(layersUpdateClone)
    setStyle(MapStyles.style.buildMapStyle(layersUpdateClone))
  }
  const updateLayers = (layersUpdate: Array<Layer>, update = true) => {
    setLayers(layersUpdate)

    if (update) {
      updateMap(layersUpdate)
    }
  }

  const {
    fitBounds,
    showShareButtons,
    primaryColor,
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
  } = props

  const border = props.border ? '1px solid #323333' : 'none'

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

  const children = props.children || ''
  const title = showTitle ? props.title : undefined
  let height = '100%'
  let topOffset = 0

  if (categories) {
    topOffset = 35
    height = 'calc(100% - 35px)'
  }

  const mobileLegendButtonTop = `${10 + topOffset}px`
  return (
    <div
      style={{
        width: '100%',
        height: `calc(${props.height} - 0px)`,
        overflow: 'hidden',
        border,
        position: 'relative'
      }}
    >
      <AutoSizer>
        {({ height, width }) => {
          let legend = <></>

          if (!width || width >= 600) {
            let insetOffset = 185

            if (!insetMap) {
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
                  width: '20%',
                  zIndex: 2
                }}
                maxHeight={`calc(${props.height} - ${legendMaxHeight}px)`}
                hideInactive={hideInactive}
                showLayersButton={showLegendLayersButton}
                layers={layers}
                title={title}
                collapsible={interactive}
                openLayersPanel={() => {
                  setMapLayersListOpen(true)
                }}
              />
            )
          }
          return (
            <div style={{ height, width }}>
              {width && width < 600 && (
                <MapToolButton
                  onClick={() => setMobileMapLegendOpen(true)}
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
                interactive={interactive}
                initialGLStyle={style}
                showLogo={showLogo}
                mapConfig={mapConfig}
                insetConfig={insetConfig}
                insetMap={insetMap}
                showScale={showScale}
                disableScrollZoom={disableScrollZoom}
                gpxLink={gpxLink}
                preserveDrawingBuffer={preserveDrawingBuffer}
                hash={hash}
                locale={locale} //pass through props locale so Map component can set it in redux
                mapboxAccessToken={mapboxAccessToken}
                DGWMSConnectID={DGWMSConnectID}
                earthEngineClientID={earthEngineClientID}
                categories={categories}
                mapLayers={layers}
                toggleVisibility={toggleVisibility}
                onLoad={onLoad}
                showPlayButton={showPlayButton}
                showMapTools={showMapTools}
                showFeatureInfoEditButtons={showFeatureInfoEditButtons}
                showSearch={showSearch}
                showFullScreen={showFullScreen}
              >
                {legend}
                <div ref={mobileMapLegend} />
                <Drawer
                  getContainer={() => mobileMapLegend.current}
                  visible={mobileMapLegendOpen}
                  onClose={() => {
                    setMobileMapLegendOpen(false)
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
                <div ref={mapLayersList} />
                <Drawer
                  getContainer={() => mapLayersList.current}
                  title={t('Map Layers')}
                  visible={mapLayersListOpen}
                  onClose={() => {
                    setMapLayersListOpen(false)
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
                      toggleVisibility={toggleVisibility}
                      updateLayers={updateLayers}
                    />
                  </Row>
                </Drawer>
                {children}
                {showShareButtons && (
                  <ShareButtons
                    title={props.title}
                    iconSize={20}
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
        }}
      </AutoSizer>
    </div>
  )
}
InteractiveMap.defaultProps = {
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
export default InteractiveMap
