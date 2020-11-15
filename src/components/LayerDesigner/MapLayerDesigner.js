// @flow
import type {Node} from "React";import React from 'react'
import LayerDesigner from './LayerDesigner'
import OpacityChooser from './OpacityChooser'
import MapStyles from '../Map/Styles'
import MapHubsComponent from '../MapHubsComponent'
import _isequal from 'lodash.isequal'
import type {Layer} from '../../types/layer'
import type {GLStyle} from '../../types/mapbox-gl-style'

type Props = {|
 id: string,
  layer: Layer,
  onStyleChange: Function,
  showAdvanced: boolean
|}

type State = {
  rasterOpacity: number
}

export default class MapLayerDesigner extends MapHubsComponent<Props, State> {
  static defaultProps: any | {|id: string, showAdvanced: boolean|} = {
    id: 'map-layer-designer',
    showAdvanced: true
  }

  constructor (props: Props) {
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

  shouldComponentUpdate (nextProps: Props, nextState: State): boolean {
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
      layers?: Array<any>,
      tiles?: Array<string>,
      type?: 
        | "multiraster"
        | "raster"
        | "mapbox-style"
        | "vector"
        | "ags-featureserver-query"
        | "ags-mapserver-query"
        | "earthengine",
      url?: string,
      ...,
    }
    | {|type: string|}) = () => {
    let sourceConfig = {
      type: 'vector'
    }
    if (this.props.layer.is_external) {
      sourceConfig = this.props.layer.external_layer_config
    }
    return sourceConfig
  }

  setRasterOpacity: any | ((opacity: number) => void) = (opacity: number) => {
    const {layer_id, shortid} = this.props.layer
    let style
    const elc = this.props.layer.external_layer_config
    if (elc && elc.type === 'multiraster') {
      style = MapStyles.raster.multiRasterStyleWithOpacity(layer_id, shortid, elc.layers, opacity, 'raster')
    } else {
      style = MapStyles.raster.rasterStyleWithOpacity(layer_id, shortid, elc, opacity)
    }

    // TODO: add legend placeholders for color opacity value?
    // var legend = MapStyles.legend.rasterLegend(this.props.layer);
    this.props.onStyleChange(layer_id, style, this.props.layer.labels, this.props.layer.legend_html)
    this.setState({rasterOpacity: opacity})
  }

   onColorChange: any | ((style: GLStyle, legend: string) => void) = (style: GLStyle, legend: string) => {
     const {layer_id, labels} = this.props.layer
     this.props.onStyleChange(layer_id, style, labels, legend)
   }

  setStyle: any | ((style: GLStyle) => void) = (style: GLStyle) => {
    const {layer_id, labels, legend_html} = this.props.layer
    this.props.onStyleChange(layer_id, style, labels, legend_html)
  }

  setLabels: any | ((style: GLStyle, labels: any) => void) = (style: GLStyle, labels: Object) => {
    this.props.onStyleChange(this.props.layer.layer_id, style, labels, this.props.layer.legend_html)
  }

  setMarkers: any | ((style: GLStyle) => void) = (style: GLStyle) => {
    this.props.onStyleChange(this.props.layer.layer_id, style, this.props.layer.labels, this.props.layer.legend_html)
  }

  setLegend: any | ((legend: string) => void) = (legend: string) => {
    this.props.onStyleChange(this.props.layer.layer_id, this.props.layer.style, this.props.layer.labels, legend)
  }

  render (): Node {
    const {t} = this
    const { layer } = this.props
    const { style, legend_html, is_external, external_layer_config } = layer
    const legendCode: string = legend_html || ''
    const elc = external_layer_config

    let designer = ''
    if (is_external && elc &&
      (
        elc.type === 'raster' ||
        elc.type === 'multiraster' ||
        elc.type === 'ags-mapserver-tiles')) {
      designer = (
        <div style={{padding: '5px'}}>
          <OpacityChooser
            value={this.state.rasterOpacity} onChange={this.setRasterOpacity}
            style={style} onStyleChange={this.setStyle} onColorChange={this.onColorChange}
            layer={this.props.layer}
            legendCode={legendCode} onLegendChange={this.setLegend} showAdvanced
            t={t}
          />
        </div>
      )
    } else if (is_external && elc &&
      elc.type === 'mapbox-style') {
      designer = (
        <div style={{marginTop: '20px', marginBottom: '20px', padding: '20px', border: '1px solid #b1b1b1'}}>
          <p>{t('Unable to change this layer')}</p>
        </div>
      )
    } else {
      designer = (
        <LayerDesigner
          onColorChange={this.onColorChange}
          style={style} onStyleChange={this.setStyle}
          labels={layer.labels} onLabelsChange={this.setLabels} onMarkersChange={this.setMarkers}
          layer={layer}
          showAdvanced={this.props.showAdvanced}
          legend={legendCode} onLegendChange={this.setLegend}
        />
      )
    }

    return (
      <>
        {designer}
      </>
    )
  }
}
