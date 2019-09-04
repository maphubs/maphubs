// @flow
import React from 'react'
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
    const sourceDisplay = this.getSource(source, this.props.mapConfig, t)

    let planetSource = ''
    if (MAPHUBS_CONFIG.PLANET_LABS_API_KEY) {
      planetSource = (
        <div className='col s6'>
          <SourceSelectionBox
            name={t('Planet API')} value='planet'
            selected={source === 'planet'} icon='satellite'
            onSelect={this.selectSource}
          />
        </div>
      )
    }

    let cancelButton = ''
    if (this.props.showCancel) {
      cancelButton = (
        <div className='left'>
          <button className='waves-effect waves-light btn' onClick={this.props.onCancel}>{this.props.cancelText}</button>
        </div>
      )
    }

    return (
      <div>
        <div className='container'>
          <div className='row' style={{margin: 'auto', textAlign: 'center'}}>
            <div className='col s5'>
              <div className='row no-margin'>
                <p style={{margin: '5px'}}>{t('Upload Data or Import MapHubs Data')}</p>
                <div className='col s6'>
                  <SourceSelectionBox
                    name={t('Upload File')} value='local'
                    selected={source === 'local'} icon='file_upload'
                    onSelect={this.selectSource}
                  />
                </div>
                <div className='col s6'>
                  <SourceSelectionBox
                    name={t('MapHubs Layer')} value='remote'
                    selected={source === 'maphubs'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </div>
              </div>
              <div className='row no-margin'>
                <p style={{margin: '5px'}}>{t('Satellite Data')}</p>
                <div className='col s6'>
                  <SourceSelectionBox
                    name={t('Upload Raster')} value='raster-upload'
                    selected={source === 'raster-upload'} icon='file_upload'
                    onSelect={this.selectSource}
                  />
                </div>
                {planetSource}
                <div className='col s6'>
                  <SourceSelectionBox
                    name={t('Digital Globe')} value='dgwms'
                    selected={source === 'dgwms'} icon='satellite'
                    onSelect={this.selectSource}
                  />
                </div>
                <div className='col s6'>
                  <SourceSelectionBox
                    name={t('Earth Engine')} value='earthengine'
                    selected={source === 'earthengine'} icon='satellite'
                    onSelect={this.selectSource}
                  />
                </div>
              </div>
            </div>
            <div className='col s7'>
              <div className='row no-margin'>
                <p style={{margin: '5px'}}>{t('Create New Data')}</p>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox
                    name={t('New Point(s)')} value='point'
                    selected={source === 'point'} icon='place'
                    onSelect={this.selectSource}
                  />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox
                    name={t('New Line(s)')} value='line'
                    selected={source === 'line'} icon='timeline'
                    onSelect={this.selectSource}
                  />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox
                    name={t('New Polygon(s)')} value='polygon'
                    selected={source === 'polygon'} icon='crop_din'
                    onSelect={this.selectSource}
                  />
                </div>
              </div>
              <div className='row no-margin'>
                <p style={{margin: '5px'}}>{t('Remote Data Sources')}</p>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox
                    name={t('GeoJSON URL')} value='geojson'
                    selected={source === 'geojson'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox
                    name={t('Mapbox Styles')} value='mapbox'
                    selected={source === 'mapbox'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox
                    name={t('Raster Tiles')} value='raster'
                    selected={source === 'raster'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox
                    name={t('Vector Tiles')} value='vector'
                    selected={source === 'vector'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox
                    name={t('ArcGIS Services')} value='ags'
                    selected={source === 'ags'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox
                    name={t('WMS')} value='wms'
                    selected={source === 'wms'} icon='cloud_download'
                    onSelect={this.selectSource}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='divider' />
        <div ref={(ref) => { this.sourceDisplay = ref }} className='container'>
          {sourceDisplay}
        </div>
        {cancelButton}

      </div>
    )
  }
}
