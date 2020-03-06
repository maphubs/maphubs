// @flow
import React from 'react'
import { Row, Col, Button, Divider } from 'antd'
import LayerSourceHelper from './LayerSourceHelper'
import SourceSelectionBox from './SourceSelectionBox'
import MapHubsComponent from '../MapHubsComponent'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

let scrollToComponent

type Props = {|
  onSubmit: Function,
  showPrev?: boolean,
  onPrev?: Function,
  onCancel?: Function,
  mapConfig: Object,
  showCancel?: boolean,
  cancelText?: string
|}

type State = {
  canSubmit: boolean,
  source: string
}

export default class CreateLayer extends MapHubsComponent<Props, State> {
   props: Props

   state = {
     canSubmit: false,
     source: ''
   }

   componentDidMount () {
     scrollToComponent = require('react-scroll-to-component')
   }

   componentDidUpdate () {
     if (this.sourceDisplay) {
       scrollToComponent(this.sourceDisplay, {align: 'bottom'})
     }
   }

  getSource = LayerSourceHelper.getSource.bind(this)

  sourceDisplay: any

  selectSource = (source: string) => {
    this.setState({source})
  }

  onCancel = () => {
    if (this.props.onCancel) this.props.onCancel()
  }

  onPrev = () => {
    if (this.props.onPrev) this.props.onPrev()
  }

  onSubmit = () => {
    this.props.onSubmit()
  }

  render () {
    const {t} = this
    const {source} = this.state
    const { showCancel, onCancel, cancelText } = this.props
    const sourceDisplay = this.getSource(source, this.props.mapConfig, t)

    return (
      <div>
        <style jsx>{`
          .section-header {
            margin: 5px;
            font-weight: 700;
            text-align: center;
          }
        `}
        </style>
        <div className='container'>
          <Row justify='center' align='top'>
            <Col span={10}>
              <Row justify='center' align='top' style={{border: '1px solid #ddd'}}>
                <p className='section-header'>{t('Upload Data')}</p>
                <Col span={12}>
                  <SourceSelectionBox
                    name={t('Upload File')} value='local'
                    selected={source === 'local'} icon='file_upload'
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col span={12}>
                  <SourceSelectionBox
                    name={t('MapHubs Layer')} value='remote'
                    selected={source === 'remote'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </Col>
              </Row>
              <Row justify='center' align='top' style={{border: '1px solid #ddd'}}>
                <p className='section-header'>{t('Satellite Data')}</p>
                <Col span={12}>
                  <SourceSelectionBox
                    name={t('Upload Raster')} value='raster-upload'
                    selected={source === 'raster-upload'} icon='file_upload'
                    onSelect={this.selectSource}
                  />
                </Col>
                {MAPHUBS_CONFIG.PLANET_LABS_API_KEY &&
                  <Col span={12}>
                    <SourceSelectionBox
                      name={t('Planet API')} value='planet'
                      selected={source === 'planet'} icon='satellite'
                      onSelect={this.selectSource}
                    />
                  </Col>}
                <Col span={12}>
                  <SourceSelectionBox
                    name={t('Digital Globe')} value='dgwms'
                    selected={source === 'dgwms'} icon='satellite'
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col span={12}>
                  <SourceSelectionBox
                    name={t('Earth Engine')} value='earthengine'
                    selected={source === 'earthengine'} icon='satellite'
                    onSelect={this.selectSource}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={14}>
              <Row justify='center' align='top' style={{border: '1px solid #ddd'}}>
                <p className='section-header'>{t('Create New Data')}</p>
                <Col sm={12} md={8} lg={8}>
                  <SourceSelectionBox
                    name={t('New Point(s)')} value='point'
                    selected={source === 'point'} icon='place'
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8}>
                  <SourceSelectionBox
                    name={t('New Line(s)')} value='line'
                    selected={source === 'line'} icon='timeline'
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8}>
                  <SourceSelectionBox
                    name={t('New Polygon(s)')} value='polygon'
                    selected={source === 'polygon'} icon='crop_din'
                    onSelect={this.selectSource}
                  />
                </Col>
              </Row>
              <Row justify='center' align='top' style={{border: '1px solid #ddd'}}>
                <p className='section-header'>{t('Remote Data Sources')}</p>
                <Col sm={12} md={8} lg={8}>
                  <SourceSelectionBox
                    name={t('GeoJSON URL')} value='geojson'
                    selected={source === 'geojson'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8}>
                  <SourceSelectionBox
                    name={t('Mapbox Styles')} value='mapbox'
                    selected={source === 'mapbox'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8}>
                  <SourceSelectionBox
                    name={t('Raster Tiles')} value='raster'
                    selected={source === 'raster'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8}>
                  <SourceSelectionBox
                    name={t('Vector Tiles')} value='vector'
                    selected={source === 'vector'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8}>
                  <SourceSelectionBox
                    name={t('ArcGIS Services')} value='ags'
                    selected={source === 'ags'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8}>
                  <SourceSelectionBox
                    name={t('WMS')} value='wms'
                    selected={source === 'wms'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <Divider />
        <div
          ref={(ref) => { this.sourceDisplay = ref }}
          className='container'
          style={{marginBottom: '20px'}}
        >
          {sourceDisplay}
        </div>
        {showCancel &&
          <Row style={{paddingLeft: '20px', marginBottom: '20px'}}>
            <Button type='danger' onClick={onCancel}>{cancelText}</Button>
          </Row>}

      </div>
    )
  }
}
