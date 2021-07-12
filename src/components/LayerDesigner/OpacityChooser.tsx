import React, { useState } from 'react'
import { Row, Col, Button, Slider, InputNumber, Tabs, Tooltip } from 'antd'
import AdvancedLayerSettings from './AdvancedLayerSettings'
import OpacityIcon from '@material-ui/icons/Opacity'
import CodeIcon from '@material-ui/icons/Code'
import dynamic from 'next/dynamic'
import mapboxgl from 'mapbox-gl'
import useT from '../../hooks/useT'
import { Layer } from '../../types/layer'

const CodeEditor = dynamic(() => import('./CodeEditor'), {
  ssr: false
})
const { TabPane } = Tabs

type Props = {
  onChange: (value: number) => void
  value: number
  onStyleChange: (style: mapboxgl.Style) => void
  onLegendChange: (legendCode: string) => void
  onColorChange: (style: mapboxgl.Style, legend: string) => void
  style: mapboxgl.Style
  legendCode: string
  layer: Layer
  showAdvanced: boolean
}

const OpacityChooser = ({
  value,
  showAdvanced,
  style,
  legendCode,
  layer,
  onChange,
  onStyleChange,
  onLegendChange,
  onColorChange
}: Props): JSX.Element => {
  const { t } = useT()
  const [showStyleEditor, setShowStyleEditor] = useState(false)
  const [showLegendEditor, setShowLegendEditor] = useState(false)

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
              <Slider min={1} max={100} onChange={onChange} value={value} />
            </Col>
            <Col span={4}>
              <InputNumber
                min={1}
                max={100}
                style={{
                  marginLeft: 16
                }}
                value={value}
                onChange={onChange}
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
                layer={layer}
                style={style}
                onChange={onColorChange}
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
                <Button
                  onClick={() => {
                    setShowStyleEditor(false)
                  }}
                  type='primary'
                >
                  {t('Style')}
                </Button>
              </Col>
              <Col sm={24} md={12}>
                <Button
                  onClick={() => {
                    setShowLegendEditor(true)
                  }}
                  type='primary'
                >
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
        initialCode={JSON.stringify(style, undefined, 2)}
        title={t('Editing Layer Style')}
        onSave={(style: string): void => {
          style = JSON.parse(style)
          onStyleChange(style)
        }}
        onCancel={() => {
          setShowStyleEditor(false)
        }}
      />
      <CodeEditor
        visible={showLegendEditor}
        id='raster-legend-editor'
        mode='html'
        initialCode={legendCode}
        title={t('Edit Layer Legend')}
        onSave={onLegendChange}
        onCancel={() => {
          setShowLegendEditor(false)
        }}
      />
    </>
  )
}
export default OpacityChooser
