// @flow
import React from 'react'
import { Row, Col, Button, Divider } from 'antd'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import PublishIcon from '@material-ui/icons/Publish'
import SatelliteIcon from '@material-ui/icons/Satellite'
import PinDropIcon from '@material-ui/icons/PinDrop'
import TimelineIcon from '@material-ui/icons/Timeline'
import CropDinIcon from '@material-ui/icons/CropDin'
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
      <>
        <style jsx global>{`
          .section-header {
            margin: 5px;
            font-weight: 700;
            text-align: center;
          }
          .source-icon {
            font-size: 48px !important;
            color: ${MAPHUBS_CONFIG.primaryColor};
          }
        `}
        </style>
        <div className='container'>
          <Row justify='center' align='top' style={{maxWidth: '850px'}}>
            <Col sm={24} md={10}>
              <p className='section-header'>{t('Upload Data')}</p>
              <Row justify='center' align='middle' style={{border: '1px solid #ddd'}}>
                <Col span={12} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('Upload File')} value='local'
                    selected={source === 'local'} icon={<PublishIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col span={12} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('MapHubs Layer')} value='remote'
                    selected={source === 'remote'} icon={<PublishIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
              </Row>
              <p className='section-header'>{t('Satellite Data')}</p>
              <Row justify='center' align='middle' style={{border: '1px solid #ddd'}}>
                <Col span={12} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('Upload Raster')} value='raster-upload'
                    selected={source === 'raster-upload'} icon={<PublishIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
                {MAPHUBS_CONFIG.PLANET_LABS_API_KEY &&
                  <Col span={12} style={{padding: '20px'}}>
                    <SourceSelectionBox
                      name={t('Planet API')} value='planet'
                      selected={source === 'planet'} icon={<SatelliteIcon className='source-icon' />}
                      onSelect={this.selectSource}
                    />
                  </Col>}
                <Col span={12} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('Digital Globe')} value='dgwms'
                    selected={source === 'dgwms'} icon={<SatelliteIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col span={12} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('Earth Engine')} value='earthengine'
                    selected={source === 'earthengine'} icon={<SatelliteIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
              </Row>
            </Col>
            <Col sm={24} md={14}>
              <p className='section-header'>{t('Create New Data')}</p>
              <Row justify='center' align='middle' style={{border: '1px solid #ddd'}}>
                <Col sm={12} md={8} lg={8} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('New Point(s)')} value='point'
                    selected={source === 'point'} icon={<PinDropIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('New Line(s)')} value='line'
                    selected={source === 'line'} icon={<TimelineIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('New Polygon(s)')} value='polygon'
                    selected={source === 'polygon'} icon={<CropDinIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
              </Row>
              <p className='section-header'>{t('Remote Data Sources')}</p>
              <Row justify='center' align='middle' style={{border: '1px solid #ddd'}}>
                <Col sm={12} md={8} lg={8} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('GeoJSON URL')} value='geojson'
                    selected={source === 'geojson'} icon={<CloudUploadIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('Mapbox Styles')} value='mapbox'
                    selected={source === 'mapbox'} icon={<CloudUploadIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('Raster Tiles')} value='raster'
                    selected={source === 'raster'} icon={<CloudUploadIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('Vector Tiles')} value='vector'
                    selected={source === 'vector'} icon={<CloudUploadIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('ArcGIS Services')} value='ags'
                    selected={source === 'ags'} icon={<CloudUploadIcon className='source-icon' />}
                    onSelect={this.selectSource}
                  />
                </Col>
                <Col sm={12} md={8} lg={8} style={{padding: '20px'}}>
                  <SourceSelectionBox
                    name={t('WMS')} value='wms'
                    selected={source === 'wms'} icon={<CloudUploadIcon className='source-icon' />}
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
      </>
    )
  }
}
