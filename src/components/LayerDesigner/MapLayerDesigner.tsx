import React from 'react'
import LayerDesigner from './LayerDesigner'
import OpacityChooser from './OpacityChooser'
import MapStyles from '../Map/Styles'

import _isequal from 'lodash.isequal'
import type { Layer } from '../../types/layer'
import mapboxgl from 'mapbox-gl'

type Props = {
  id: string
  layer: Layer
  onStyleChange: (...args: Array<any>) => any
  showAdvanced: boolean
}
type State = {
  rasterOpacity: number
}
export default class MapLayerDesigner extends React.Component<Props, State> {
  static defaultProps:
    | any
    | {
        id: string
        showAdvanced: boolean
      } = {
    id: 'map-layer-designer',
    showAdvanced: true
  }

  constructor(props: Props) {
    super(props)
    let style, legend

    if (props.layer && props.layer.style) {
      style = props.layer.style
    }

    if (props.layer && props.layer.legend_html) {
      legend = props.layer.legend_html
    }

    this.state = {
      style,
      rasterOpacity: 100,
      layer: props.layer,
      legend
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }

    if (!_isequal(this.state, nextState)) {
      return true
    }

    return false
  }

  getSourceConfig:
    | any
    | (() =>
        | void
        | {
            layers?: Array<any>
            tiles?: Array<string>
            type?:
              | 'multiraster'
              | 'raster'
              | 'mapbox-style'
              | 'vector'
              | 'ags-featureserver-query'
              | 'ags-mapserver-query'
              | 'earthengine'
            url?: string
          }
        | {
            type: string
          }) = () => {
    let sourceConfig = {
      type: 'vector'
    }

    if (this.props.layer.is_external) {
      sourceConfig = this.props.layer.external_layer_config
    }

    return sourceConfig
  }
  setRasterOpacity: any | ((opacity: number) => void) = (opacity: number) => {
    const { layer_id, shortid, labels, legend_html, external_layer_config } =
      this.props.layer

    const elc = external_layer_config

    const style =
      elc && elc.type === 'multiraster'
        ? MapStyles.raster.multiRasterStyleWithOpacity(
            layer_id,
            shortid,
            elc.layers,
            opacity,
            'raster'
          )
        : MapStyles.raster.rasterStyleWithOpacity(
            layer_id,
            shortid,
            elc,
            opacity
          )

    // TODO: add legend placeholders for color opacity value?
    // var legend = MapStyles.legend.rasterLegend(this.props.layer);
    this.props.onStyleChange(layer_id, style, labels, legend_html)
    this.setState({
      rasterOpacity: opacity
    })
  }
  onColorChange = (style: mapboxgl.Style, legend: string): void => {
    const { layer_id, labels } = this.props.layer
    this.props.onStyleChange(layer_id, style, labels, legend)
  }
  setStyle = (style: mapboxgl.Style): void => {
    const { layer_id, labels, legend_html } = this.props.layer
    this.props.onStyleChange(layer_id, style, labels, legend_html)
  }
  setLabels = (style: mapboxgl.Style, labels: Record<string, any>): void => {
    this.props.onStyleChange(
      this.props.layer.layer_id,
      style,
      labels,
      this.props.layer.legend_html
    )
  }
  setMarkers = (style: mapboxgl.Style): void => {
    this.props.onStyleChange(
      this.props.layer.layer_id,
      style,
      this.props.layer.labels,
      this.props.layer.legend_html
    )
  }
  setLegend = (legend: string): void => {
    this.props.onStyleChange(
      this.props.layer.layer_id,
      this.props.layer.style,
      this.props.layer.labels,
      legend
    )
  }

  render(): JSX.Element {
    const {
      t,
      props,
      state,
      setRasterOpacity,
      setStyle,
      onColorChange,
      setLegend,
      setLabels,
      setMarkers
    } = this
    const { layer, showAdvanced } = props
    const { rasterOpacity } = state
    const { style, legend_html, is_external, external_layer_config, labels } =
      layer
    const legendCode: string = legend_html || ''
    const elc = external_layer_config
    let designer = <></>

    if (
      is_external &&
      elc &&
      (elc.type === 'raster' ||
        elc.type === 'multiraster' ||
        elc.type === 'ags-mapserver-tiles')
    ) {
      designer = (
        <div
          style={{
            padding: '5px'
          }}
        >
          <OpacityChooser
            value={rasterOpacity}
            onChange={setRasterOpacity}
            style={style}
            onStyleChange={setStyle}
            onColorChange={onColorChange}
            layer={layer}
            legendCode={legendCode}
            onLegendChange={setLegend}
            showAdvanced
            t={t}
          />
        </div>
      )
    } else if (is_external && elc && elc.type === 'mapbox-style') {
      designer = (
        <div
          style={{
            marginTop: '20px',
            marginBottom: '20px',
            padding: '20px',
            border: '1px solid #b1b1b1'
          }}
        >
          <p>{t('Unable to change this layer')}</p>
        </div>
      )
    } else {
      designer = (
        <LayerDesigner
          onColorChange={onColorChange}
          style={style}
          onStyleChange={setStyle}
          labels={labels}
          onLabelsChange={setLabels}
          onMarkersChange={setMarkers}
          layer={layer}
          showAdvanced={showAdvanced}
          legend={legendCode}
          onLegendChange={setLegend}
        />
      )
    }

    return <>{designer}</>
  }
}
