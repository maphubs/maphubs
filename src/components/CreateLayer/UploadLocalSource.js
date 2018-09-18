// @flow
import React from 'react'
import UppyFileUpload from '../forms/UppyFileUpload'
import Map from '../Map/Map'
import NotificationActions from '../../actions/NotificationActions'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import MessageActions from '../../actions/MessageActions'
import RadioModal from '../RadioModal'
import Progress from '../Progress'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'
import superagent from 'superagent'
// import DebugService from '../../services/debug'
// const debug = DebugService('UploadLocalSource')

let scrollToComponent

type Props = {|
  onSubmit: Function,
  mapConfig: Object
|}

type State = {
  canSubmit: boolean,
  largeData: boolean,
  processing: boolean,
  multipleShapefiles: any,
  bbox: Object
} & LocaleStoreState & LayerStoreState

export default class UploadLocalSource extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    canSubmit: false,
    largeData: false,
    processing: false,
    multipleShapefiles: null,
    bbox: null,
    layer: {}
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  componentDidMount () {
    scrollToComponent = require('react-scroll-to-component')
  }

  componentDidUpdate () {
    if (this.state.canSubmit) {
      scrollToComponent(this.refs.map)
    }
    if (this.state.multipleShapefiles) {
      this.refs.chooseshape.show()
    }
  }

  onSubmit = () => {
    const _this = this
    const data = {
      is_external: false,
      external_layer_type: '',
      external_layer_config: {}
    }

    LayerActions.saveDataSettings(data, _this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: _this.__('Error'), message: err})
      } else {
        NotificationActions.showNotification({message: _this.__('Layer Saved'), dismissAfter: 1000, onDismiss: _this.props.onSubmit})
      }
    })
  }

  onUpload = (file: Object) => {
    const _this = this
    const {layer_id} = this.state
    this.onProcessingStart()
    superagent.post('/api/layer/complete/upload')
      .type('json').accept('json')
      .send({
        uploadUrl: file.uploadURL,
        layer_id,
        originalName: file.data.name
      })
      .end((err, res) => {
        if (err) {
          _this.onUploadError(err)
        } else {
          const result = res.body
          if (result.success) {
            LayerActions.setDataType(result.data_type)
            LayerActions.setImportedTags(result.uniqueProps, true)
            this.setState({canSubmit: true, processing: false, bbox: result.bbox})
          } else {
            if (result.code === 'MULTIPLESHP') {
              this.setState({multipleShapefiles: result.shapefiles, processing: false})
            } else {
              MessageActions.showMessage({title: _this.__('Error'), message: result.error || 'Unknown Error'})
            }
          }
        }
      })
  }

  onUploadError = (err: string) => {
    MessageActions.showMessage({title: this.__('Error'), message: err})
  }

  finishUpload = (shapefileName: string) => {
    const {setState, __} = this
    LayerActions.finishUpload(shapefileName, this.state._csrf, (err, result) => {
      if (err) {
        MessageActions.showMessage({title: __('Error'), message: err})
      } else if (result.success) {
        LayerActions.setDataType(result.data_type)
        LayerActions.setImportedTags(result.uniqueProps, true)
        setState({canSubmit: true, multipleShapefiles: null})
      } else {
        MessageActions.showMessage({title: __('Error'), message: result.error})
      }
    })
  }

  onProcessingStart = () => {
    this.setState({processing: true})
  }

  render () {
    const layer_id = this.state.layer_id ? this.state.layer_id : 0
    const { canSubmit, multipleShapefiles, style, bbox } = this.state
    const {mapConfig} = this.props

    /*
    let mapExtent
    if (bbox) {
      const bbox = preview_position.bbox
      mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
    }
    */

    let map = ''
    if (canSubmit && style) {
      map = (
        <div>
          <p>{this.__('Please review the data on the map to confirm the upload was successful.')}</p>
          <Map ref='map' style={{width: '100%', height: '400px'}}
            id='upload-preview-map'
            showFeatureInfoEditButtons={false}
            mapConfig={mapConfig}
            glStyle={style}
            fitBounds={bbox}
          />
        </div>
      )
    }

    let multipleShapefilesDisplay = ''
    if (multipleShapefiles) {
      const options = []
      multipleShapefiles.forEach((shpFile) => {
        options.push({value: shpFile, label: shpFile})
      })
      multipleShapefilesDisplay = (
        <RadioModal ref='chooseshape' title={this.__('Multiple Shapefiles Found - Please Select One')}
          options={options} onSubmit={this.finishUpload} />
      )
    }

    return (
      <div className='row'>
        <style jsx>{`
          #upload-process-progess {
            z-index: 9999 !important;
          }
        `}</style>
        <Progress id='upload-process-progess' title={this.__('Processing Data')} subTitle='' dismissible={false} show={this.state.processing} />     
        <div>
          <div className='row'>
            <div style={{margin: 'auto auto', maxWidth: '750px'}}>
              <UppyFileUpload
                endpoint='/api/layer/upload'
                note='Supported files: Shapefile (Zip), GeoJSON, KML,  GPX (tracks or waypoints), or CSV (with Lat/Lon fields), and MapHubs format'
                layer_id={layer_id}
                onProcessingStart={this.onProcessingStart}
                onComplete={this.onUpload}
                onError={this.onUploadError}
              />
            </div>
          </div>
          <div className='row'>
            {map}
          </div>
          {multipleShapefilesDisplay}
        </div>
        <div className='right'>
          <button className='waves-effect waves-light btn' disabled={!canSubmit} onClick={this.onSubmit}><i className='material-icons right'>arrow_forward</i>{this.__('Save and Continue')}</button>
        </div>
      </div>
    )
  }
}
