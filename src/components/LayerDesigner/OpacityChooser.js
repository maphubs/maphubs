// @flow
import React from 'react'
import { Row, Col } from 'antd'
import AdvancedLayerSettings from './AdvancedLayerSettings'
import _isequal from 'lodash.isequal'

import type {GLStyle} from '../../types/mapbox-gl-style'
import dynamic from 'next/dynamic'
const CodeEditor = dynamic(() => import('./CodeEditor'), {
  ssr: false
})

type Props = {|
  onChange: Function,
  value: number,
  onStyleChange: Function,
  onLegendChange: Function,
  onColorChange: Function,
  style: Object,
  legendCode: string,
  layer: Object,
  showAdvanced: boolean,
  t: Function
|}

type State = {
  opacity: number,
  showStyleEditor?: boolean,
  showLegendEditor?: boolean
}

export default class OpacityChooser extends React.Component<Props, State> {
  static defaultProps = {
    value: 100
  }

  constructor (props: Props) {
    super(props)
    this.state = {
      opacity: props.value,
      style: props.style,
      legendCode: props.legendCode
    }
  }

  componentDidMount () {
    M.Collapsible.init(this.refs.collapsible, {
      accordion: true
    })
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

  onChange = (e: any) => {
    const opacity = e.target.valueAsNumber
    this.setState({opacity})
    this.props.onChange(opacity)
  }

  onStyleChange = (style: Object) => {
    this.props.onStyleChange(style)
  }

  onCodeStyleChange = (style: string) => {
    style = JSON.parse(style)
    this.props.onStyleChange(style)
  }

  onLegendChange = (legendCode: string) => {
    this.props.onLegendChange(legendCode)
  }

  onAdvancedSettingsChange = (style: GLStyle, legend: string) => {
    this.props.onColorChange(style, legend)
  }

  showStyleEditor = () => {
    this.setState({showStyleEditor: true})
  }

  showLegendEditor = () => {
    this.setState({showLegendEditor: true})
  }

  hideStyleEditor = () => {
    this.setState({showStyleEditor: false})
  }

  hideLegendEditor = () => {
    this.setState({showLegendEditor: false})
  }

  render () {
    const { showAdvanced, style, legendCode, t } = this.props
    const { showStyleEditor, showLegendEditor, opacity } = this.state

    return (
      <div>
        <ul ref='collapsible' className='collapsible' data-collapsible='accordion'>
          <li className='active'>
            <div className='collapsible-header'>
              <i className='material-icons'>opacity</i>{t('Opacity')}
            </div>
            <div className='collapsible-body'>
              <Row style={{marginBottom: '20px'}}>
                <form action='#'>
                  <p className='range-field'>
                    <input type='range' id='opacity' min='0' max='100' value={opacity} onChange={this.onChange} />
                  </p>
                </form>
              </Row>
              <Row style={{marginBottom: '20px'}}>
                <div className='valign-wrapper'>
                  <h5 className='valign' style={{margin: 'auto'}}>
                    {opacity}%
                  </h5>
                </div>
              </Row>
            </div>
          </li>
          {showAdvanced &&
            <li>
              <div className='collapsible-header'>
                <i className='material-icons'>code</i>{t('Advanced')}
              </div>
              <div className='collapsible-body'>
                <AdvancedLayerSettings layer={this.props.layer} style={style} onChange={this.onAdvancedSettingsChange} />
                <Row style={{marginBottom: '20px'}}>
                  <Col sm={24} md={12}>
                    <button onClick={this.showStyleEditor} className='btn'>{t('Style')}</button>
                  </Col>
                  <Col sm={24} md={12}>
                    <button onClick={this.showLegendEditor} className='btn'>{t('Legend')}</button>
                  </Col>
                </Row>
              </div>
            </li>}

        </ul>
        <CodeEditor
          visible={showStyleEditor}
          id='raster-style-editor' mode='json'
          code={JSON.stringify(style, undefined, 2)}
          title={t('Editing Layer Style')}
          onSave={this.onCodeStyleChange}
          onCancel={this.hideStyleEditor}
          t={t}
        />
        <CodeEditor
          visible={showLegendEditor}
          id='raster-legend-editor' mode='html'
          code={legendCode}
          title={t('Edit Layer Legend')}
          onSave={this.onLegendChange}
          onCancel={this.hideLegendEditor}
          t={t}
        />
      </div>
    )
  }
}
