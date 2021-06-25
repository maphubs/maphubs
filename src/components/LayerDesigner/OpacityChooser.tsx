import React from 'react'
import { Row, Col, Button, Slider, InputNumber, Tabs, Tooltip } from 'antd'
import AdvancedLayerSettings from './AdvancedLayerSettings'
import OpacityIcon from '@material-ui/icons/Opacity'
import CodeIcon from '@material-ui/icons/Code'
import type { GLStyle } from '../../types/mapbox-gl-style'
import dynamic from 'next/dynamic'
const CodeEditor = dynamic(() => import('./CodeEditor'), {
  ssr: false
})
const { TabPane } = Tabs
type Props = {
  onChange: (...args: Array<any>) => any
  value: number
  onStyleChange: (...args: Array<any>) => any
  onLegendChange: (...args: Array<any>) => any
  onColorChange: (...args: Array<any>) => any
  style: Record<string, any>
  legendCode: string
  layer: Record<string, any>
  showAdvanced: boolean
  t: (...args: Array<any>) => any
}
type State = {
  opacity: number
  showStyleEditor?: boolean
  showLegendEditor?: boolean
}
export default class OpacityChooser extends React.Component<Props, State> {
  static defaultProps: {
    value: number
  } = {
    value: 100
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      opacity: props.value,
      style: props.style,
      legendCode: props.legendCode
    }
  }

  onChange = (opacity) => {
    this.setState({
      opacity
    })
    this.props.onChange(opacity)
  }
  onStyleChange: (style: any) => void = (style: Record<string, any>) => {
    this.props.onStyleChange(style)
  }
  onCodeStyleChange: (style: string) => void = (style: string) => {
    style = JSON.parse(style)
    this.props.onStyleChange(style)
  }
  onLegendChange: (legendCode: string) => void = (legendCode: string) => {
    this.props.onLegendChange(legendCode)
  }
  onAdvancedSettingsChange: (style: GLStyle, legend: string) => void = (
    style: GLStyle,
    legend: string
  ) => {
    this.props.onColorChange(style, legend)
  }
  showStyleEditor: () => void = () => {
    this.setState({
      showStyleEditor: true
    })
  }
  showLegendEditor: () => void = () => {
    this.setState({
      showLegendEditor: true
    })
  }
  hideStyleEditor: () => void = () => {
    this.setState({
      showStyleEditor: false
    })
  }
  hideLegendEditor: () => void = () => {
    this.setState({
      showLegendEditor: false
    })
  }

  render(): JSX.Element {
    const { showAdvanced, style, legendCode, t } = this.props
    const { showStyleEditor, showLegendEditor, opacity } = this.state
    return (
      <>
        <style jsx global>
          {`
            .ant-tabs-content {
              height: 100%;
              width: 100%;
            }
            .ant-tabs-tabpane {
              height: 100%;
            }

            .ant-tabs-left-bar .ant-tabs-tab {
              padding: 8px 12px !important;
            }

            .ant-tabs > .ant-tabs-content > .ant-tabs-tabpane-inactive {
              display: none;
            }
            .ant-tabs .ant-tabs-left-content {
              padding-left: 0;
            }
          `}
        </style>
        <Tabs
          defaultActiveKey='opacity'
          tabPosition='left'
          animated={false}
          style={{
            height: '100%',
            width: '100%'
          }}
        >
          <TabPane
            key='opacity'
            tab={
              <Tooltip title={t('Opacity')} placement='right'>
                <span>
                  <OpacityIcon />
                </span>
              </Tooltip>
            }
          >
            <Row
              justify='center'
              align='middle'
              style={{
                minWidth: '300px',
                padding: '10px'
              }}
            >
              <Col span={12}>
                <Slider
                  min={1}
                  max={100}
                  onChange={this.onChange}
                  value={typeof opacity === 'number' ? opacity : 0}
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  min={1}
                  max={100}
                  style={{
                    marginLeft: 16
                  }}
                  value={opacity}
                  onChange={this.onChange}
                />
              </Col>
            </Row>
          </TabPane>
          {showAdvanced && (
            <TabPane
              key='advanced'
              tab={
                <Tooltip title={t('Advanced')} placement='right'>
                  <span>
                    <CodeIcon />
                  </span>
                </Tooltip>
              }
            >
              <Row justify='center' align='middle'>
                <AdvancedLayerSettings
                  layer={this.props.layer}
                  style={style}
                  onChange={this.onAdvancedSettingsChange}
                />
              </Row>
              <Row
                justify='center'
                align='middle'
                style={{
                  marginBottom: '20px'
                }}
              >
                <Col sm={24} md={12}>
                  <Button onClick={this.showStyleEditor} type='primary'>
                    {t('Style')}
                  </Button>
                </Col>
                <Col sm={24} md={12}>
                  <Button onClick={this.showLegendEditor} type='primary'>
                    {t('Legend')}
                  </Button>
                </Col>
              </Row>
            </TabPane>
          )}
        </Tabs>
        <CodeEditor
          visible={showStyleEditor}
          id='raster-style-editor'
          mode='json'
          code={JSON.stringify(style, undefined, 2)}
          title={t('Editing Layer Style')}
          onSave={this.onCodeStyleChange}
          onCancel={this.hideStyleEditor}
          t={t}
        />
        <CodeEditor
          visible={showLegendEditor}
          id='raster-legend-editor'
          mode='html'
          code={legendCode}
          title={t('Edit Layer Legend')}
          onSave={this.onLegendChange}
          onCancel={this.hideLegendEditor}
          t={t}
        />
      </>
    )
  }
}
