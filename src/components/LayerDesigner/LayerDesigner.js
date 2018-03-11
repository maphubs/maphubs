// @flow
import React from 'react'
import CodeEditor from './CodeEditor'
import LabelSettings from './LabelSettings'
import MarkerSettings from './MarkerSettings'
import AdvancedLayerSettings from './AdvancedLayerSettings'
import MapHubsComponent from '../MapHubsComponent'
import MapStyles from '../Map/Styles'
import {SketchPicker, SwatchesPicker} from 'react-color'
import type {GLStyle} from '../../types/mapbox-gl-style'

const $ = require('jquery')

type ColorValue = {
  hex: string,
  rgb: {r: number, g: number, b: number, a: number}
}
type Props = {|
  onColorChange: Function,
  onStyleChange: Function,
  onLabelsChange: Function,
  onMarkersChange: Function,
  onLegendChange: Function,
  alpha: number,
  style: Object,
  labels: Object,
  legend: string,
  layer: Object,
  showAdvanced: boolean
|}

type DefaultProps = {
  alpha: number,
  showAdvanced: boolean
}

type State = {
  color: string,
  markers?: Object
}

export default class LayerDesigner extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps: DefaultProps = {
    alpha: 0.5,
    showAdvanced: true
  }

  constructor (props: Props) {
    super(props)
    const color = this.getColorFromStyle(props.style)
    this.state = {
      color
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    const color = this.getColorFromStyle(nextProps.style)
    this.setState({
      color
    })
  }

  componentDidMount () {
    $(this.refs.collapsible).collapsible({
      accordion: true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    })
  }

  getColorFromStyle = (style: GLStyle): string => {
    let color = 'rgba(255,0,0,0.65)'
    const prevColor = MapStyles.settings.get(style, 'color')
    if (prevColor) {
      color = prevColor
    }
    return color
  }

  setColorInStyle = (style: GLStyle, color: string):GLStyle => {
    style = MapStyles.settings.set(style, 'color', color)
    return style
  }

  onColorChange = (color: string) => {
    let style = this.setColorInStyle(this.props.style, color)
    style = MapStyles.color.updateStyleColor(style, color)
    const legend = MapStyles.legend.legendWithColor(this.props.layer, color)
    this.setState({color})
    this.props.onColorChange(style, legend)
  }

  onColorPickerChange = (colorValue: ColorValue) => {
    const color = `rgba(${colorValue.rgb.r},${colorValue.rgb.g},${colorValue.rgb.b},${colorValue.rgb.a})`
    this.onColorChange(color)
  }

  onStyleChange = (style: Object) => {
    this.props.onStyleChange(style)
  }

  onCodeStyleChange = (style: string) => {
    style = JSON.parse(style)
    this.props.onStyleChange(style)
  }

  onLabelsChange = (style: GLStyle, labels: Object) => {
    this.props.onLabelsChange(style, labels)
  }

  onMarkersChange = (style: GLStyle, markers: Object) => {
    this.props.onMarkersChange(style, markers)
  }

  onLegendChange = (legend: string) => {
    this.props.onLegendChange(legend)
  }

  showStyleEditor = () => {
    this.refs.styleEditor.show()
  }

  showLegendEditor = () => {
    this.refs.legendEditor.show()
  }

  onAdvancedSettingsChange = (style: GLStyle, legend: string) => {
    this.props.onColorChange(style, legend)
  }

  render () {
    let markers = ''
    if (this.props.layer.data_type === 'point') {
      markers = (
        <li>
          <div className='collapsible-header'>
            <i className='material-icons'>place</i>{this.__('Markers')}
          </div>
          <div className='collapsible-body'>
            <MarkerSettings onChange={this.onMarkersChange} style={this.props.style} layer={this.props.layer} />
          </div>
        </li>
      )
    }

    let advanced = ''
    if (this.props.showAdvanced) {
      advanced = (
        <li>
          <div className='collapsible-header'>
            <i className='material-icons'>code</i>{this.__('Advanced')}
          </div>
          <div className='collapsible-body'>
            <AdvancedLayerSettings layer={this.props.layer} style={this.props.style} onChange={this.onAdvancedSettingsChange} />
            <div className='row'>
              <div className='col s12, m6'>
                <button onClick={this.showStyleEditor} className='btn'>{this.__('Style')}</button>
              </div>
              <div className='col s12, m6'>
                <button onClick={this.showLegendEditor} className='btn'>{this.__('Legend')}</button>
              </div>
            </div>
          </div>
        </li>
      )
    }

    return (
      <div>
        <ul ref='collapsible' className='collapsible' data-collapsible='accordion'>
          <li className='active'>
            <div className='collapsible-header'>
              <i className='material-icons'>color_lens</i>{this.__('Colors')}
            </div>
            <div className='collapsible-body'>
              <SwatchesPicker width='100%' onChange={this.onColorPickerChange}
                colors={[
                  ['rgba(183,28,28,0.65)', 'rgba(211,47,47,0.65)', 'rgba(244,67,54,0.65)', 'rgba(229,115,115,0.65)', 'rgba(255,205,210,0.65)'],
                  ['rgba(136,14,79,0.65)', 'rgba(194,24,91,0.65)', 'rgba(233,30,99,0.65)', 'rgba(240,98,146,0.65)', 'rgba(248,187,208,0.65)'],
                  ['rgba(74,20,140,0.65)', 'rgba(123,31,162,0.65)', 'rgba(156,39,176,0.65)', 'rgba(186,104,200,0.65)', 'rgba(225,190,231,0.65)'],
                  ['rgba(49,27,146,0.65)', 'rgba(81,45,168,0.65)', 'rgba(103,58,183,0.65)', 'rgba(149,117,205,0.65)', 'rgba(209,196,233,0.65)'],
                  ['rgba(26,35,126,0.65)', 'rgba(48,63,159,0.65)', 'rgba(63,81,181,0.65)', 'rgba(121,134,203,0.65)', 'rgba(197,202,233,0.65)'],
                  ['rgba(13,71,161,0.65)', 'rgba(25,118,210,0.65)', 'rgba(33,150,243,0.65)', 'rgba(100,181,246,0.65)', 'rgba(187,222,251,0.65)'],
                  ['rgba(1,87,155,0.65)', 'rgba(2,136,209,0.65)', 'rgba(3,169,244,0.65)', 'rgba(79,195,247,0.65)', 'rgba(179,229,252,0.65)'],
                  ['rgba(0,96,100,0.65)', 'rgba(0,151,167,0.65)', 'rgba(0,188,212,0.65)', 'rgba(77,208,225,0.65)', 'rgba(178,235,242,0.65)'],
                  ['rgba(0,77,64,0.65)', 'rgba(0,121,107,0.65)', 'rgba(0,150,136,0.65)', 'rgba(77,182,172,0.65)', 'rgba(178,223,219,0.65)'],
                  ['rgba(25,77,51,0.65)', 'rgba(56,142,60,0.65)', 'rgba(76,175,80,0.65)', 'rgba(129,199,132,0.65)', 'rgba(200,230,201,0.65)'],
                  ['rgba(51,105,30,0.65)', 'rgba(104,159,56,0.65)', 'rgba(139,195,74,0.65)', 'rgba(174,213,129,0.65)', 'rgba(220,237,200,0.65)'],
                  ['rgba(130,119,23,0.65)', 'rgba(175,180,43,0.65)', 'rgba(205,220,57,0.65)', 'rgba(220,231,117,0.65)', 'rgba(240,244,195,0.65)'],
                  ['rgba(245,127,23,0.65)', 'rgba(251,192,45,0.65)', 'rgba(255,235,59,0.65)', 'rgba(255,241,118,0.65)', 'rgba(255,249,196,0.65)'],
                  ['rgba(255,111,0,0.65)', 'rgba(255,160,0,0.65)', 'rgba(255,193,7,0.65)', 'rgba(255,213,79,0.65)', 'rgba(255,236,179,0.65)'],
                  ['rgba(230,81,0,0.65)', 'rgba(245,124,0,0.65)', 'rgba(255,152,0,0.65)', 'rgba(255,183,77,0.65)', 'rgba(255,224,178,0.65)'],
                  ['rgba(191,54,12,0.65)', 'rgba(230,74,25,0.65)', 'rgba(255,87,34,0.65)', 'rgba(255,138,101,0.65)', 'rgba(255,204,188,0.65)'],
                  ['rgba(62,39,35,0.65)', 'rgba(93,64,55,0.65)', 'rgba(121,85,72,0.65)', 'rgba(161,136,127,0.65)', 'rgba(215,204,200,0.65)'],
                  ['rgba(38,50,56,0.65)', 'rgba(69,90,100,0.65)', 'rgba(96,125,139,0.65)', 'rgba(144,164,174,0.65)', 'rgba(207,216,220,0.65)'],
                  ['rgba(0,0,0,0.65)', 'rgba(82,82,82,0.65)', 'rgba(150,150,150,0.65)', 'rgba(217,217,217,0.65)', 'rgba(255,255,255,0.65)']]}
              />
            </div>
          </li>
          <li>
            <div className='collapsible-header'>
              <i className='material-icons'>expand_more</i>{this.__('More Colors')}
            </div>
            <div className='collapsible-body'>
              <SketchPicker
                width='calc(100% - 20px)'
                color={this.state.color}
                onChangeComplete={this.onColorPickerChange}
              />
            </div>
          </li>
          <li>
            <div className='collapsible-header'>
              <i className='material-icons'>label</i>{this.__('Labels')}
            </div>
            <div className='collapsible-body'>
              <LabelSettings onChange={this.onLabelsChange} style={this.props.style} labels={this.props.labels} layer={this.props.layer} />
            </div>
          </li>
          {markers}
          {advanced}

        </ul>
        <CodeEditor ref='styleEditor' id='layer-style-editor' mode='json'
          code={JSON.stringify(this.props.style, undefined, 2)} title={this.__('Editing Layer Style')} onSave={this.onCodeStyleChange} />
        <CodeEditor ref='legendEditor' id='layer-legend-editor' mode='html'
          code={this.props.legend} title={this.__('Edit Layer Legend')} onSave={this.onLegendChange} />
      </div>
    )
  }
}
