// @flow
import React from 'react'
import LayerSourceHelper from './LayerSourceHelper'
import SourceSelectionBox from './SourceSelectionBox'
import MapHubsComponent from '../MapHubsComponent'

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

  getSource = LayerSourceHelper.getSource.bind(this)

  sourceDisplay: any

  selectSource = (source: string) => {
    this.setState({source})
    scrollToComponent(this.sourceDisplay, {align: 'bottom'})
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
    const sourceDisplay = this.getSource(this.state.source, this.props.mapConfig)

    let planetSource = ''
    if (MAPHUBS_CONFIG.mapHubsPro) {
      planetSource = (
        <div className='col s6'>
          <SourceSelectionBox name={this.__('Planet API')} value={'planet'}
            selected={this.state.source === 'planet'} icon='satellite'
            onSelect={this.selectSource} />
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
                <p style={{margin: '5px'}}>{this.__('Upload Data or Import MapHubs Data')}</p>
                <div className='col s6'>
                  <SourceSelectionBox name={this.__('Upload File')} value={'local'}
                    selected={this.state.source === 'local'} icon='file_upload'
                    onSelect={this.selectSource} />
                </div>
                <div className='col s6'>
                  <SourceSelectionBox name={this.__('MapHubs Layer')} value={'remote'}
                    selected={this.state.source === 'maphubs'} icon='cloud_download'
                    onSelect={this.selectSource} />
                </div>
              </div>
              <div className='row no-margin'>
                <p style={{margin: '5px'}}>{this.__('Satellite Data')}</p>
                {planetSource}
                <div className='col s6'>
                  <SourceSelectionBox name={this.__('Sentinel-2')} value={'sentinel'}
                    selected={this.state.source === 'sentinel'} icon='satellite'
                    onSelect={this.selectSource} />
                </div>
                <div className='col s6'>
                  <SourceSelectionBox name={this.__('Digital Globe')} value={'dgwms'}
                    selected={this.state.source === 'dgwms'} icon='satellite'
                    onSelect={this.selectSource} />
                </div>
              </div>
            </div>
            <div className='col s7'>
              <div className='row no-margin'>
                <p style={{margin: '5px'}}>{this.__('Create New Data')}</p>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox name={this.__('New Point(s)')} value={'point'}
                    selected={this.state.source === 'point'} icon='place'
                    onSelect={this.selectSource} />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox name={this.__('New Line(s)')} value={'line'}
                    selected={this.state.source === 'line'} icon='timeline'
                    onSelect={this.selectSource} />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox name={this.__('New Polygon(s)')} value={'polygon'}
                    selected={this.state.source === 'polygon'} icon='crop_din'
                    onSelect={this.selectSource} />
                </div>
              </div>
              <div className='row no-margin'>
                <p style={{margin: '5px'}}>{this.__('Remote Data Sources')}</p>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox name={this.__('GeoJSON URL')} value={'geojson'}
                    selected={this.state.source === 'geojson'} icon='cloud_download'
                    onSelect={this.selectSource} />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox name={this.__('Mapbox Styles')} value={'mapbox'}
                    selected={this.state.source === 'mapbox'} icon='cloud_download'
                    onSelect={this.selectSource} />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox name={this.__('Raster Tiles')} value={'raster'}
                    selected={this.state.source === 'raster'} icon='cloud_download'
                    onSelect={this.selectSource} />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox name={this.__('Vector Tiles')} value={'vector'}
                    selected={this.state.source === 'vector'} icon='cloud_download'
                    onSelect={this.selectSource} />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox name={this.__('ArcGIS Services')} value={'ags'}
                    selected={this.state.source === 'ags'} icon='cloud_download'
                    onSelect={this.selectSource} />
                </div>
                <div className='col s6 m4 l4'>
                  <SourceSelectionBox name={this.__('WMS')} value={'wms'}
                    selected={this.state.source === 'wms'} icon='cloud_download'
                    onSelect={this.selectSource} />
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
