// @flow
import React from 'react'
import UppyFileUpload from '../forms/UppyFileUpload'
import Map from '../Map'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import MessageActions from '../../actions/MessageActions'
import Progress from '../Progress'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'
import superagent from 'superagent'
import { message } from 'antd'
// import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
// const debug = DebugService('UploadLocalSource')

let scrollToComponent

type Props = {|
  onSubmit: Function,
  mapConfig: Object
|}

type State = {
  canSubmit: boolean,
  processing: boolean,
  bbox?: Object
} & LocaleStoreState & LayerStoreState

export default class UploadRasterSource extends MapHubsComponent<Props, State> {
  state: State = {
    canSubmit: false,
    processing: false,
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
      scrollToComponent(this.refs.mapSection)
    }
  }

  onSubmit = () => {
    const {t} = this
    message.success(t('Layer Saved'))
    this.props.onSubmit()
  }

  onUpload = (file: Object) => {
    const {t} = this
    const _this = this
    this.onProcessingStart()
    superagent.post(`${MAPHUBS_CONFIG.RASTER_UPLOAD_API}/upload/complete`)
      .set({'Content-Type': 'application/json', 'Authorization': 'Bearer ' + MAPHUBS_CONFIG.RASTER_UPLOAD_API_KEY})
      .accept('json')
      .send({
        uploadUrl: file.uploadURL,
        originalName: file.data.name
      })
      .end((err, res) => {
        if (err) {
          _this.onUploadError(err)
        } else {
          const result = res.body
          LayerActions.saveDataSettings({
            is_external: true,
            external_layer_type: 'Raster Tile Service',
            external_layer_config: {
              type: 'raster',
              minzoom: parseInt(result.minzoom, 10),
              maxzoom: parseInt(result.maxzoom, 10),
              bounds: result.bounds,
              tiles: result.tiles,
              scheme: result.scheme
            }
          }, _this.state._csrf, (err) => {
            if (err) {
              MessageActions.showMessage({title: t('Error'), message: err})
            } else {
              // reset style to load correct source
              LayerActions.resetStyle()
              // tell the map that the data is initialized
              LayerActions.tileServiceInitialized()
              this.setState({canSubmit: true, processing: false, bbox: result.bounds})
            }
          })
        }
      })
  }

  onUploadError = (err: string) => {
    const {t} = this
    MessageActions.showMessage({title: t('Error'), message: err})
  }

  onProcessingStart = () => {
    this.setState({processing: true})
  }

  render () {
    const {t} = this
    const layer_id = this.state.layer_id ? this.state.layer_id : 0
    const { canSubmit, style, bbox } = this.state
    const {mapConfig} = this.props

    return (
      <div className='row'>
        <style jsx>{`
          #upload-process-progess {
            z-index: 9999 !important;
          }
        `}</style>
        <Progress id='upload-process-progess' title={t('Processing Data')} subTitle='' dismissible={false} show={this.state.processing} />
        <div>
          <div className='row'>
            <div style={{margin: 'auto auto', maxWidth: '750px'}}>
              <UppyFileUpload
                endpoint={`${MAPHUBS_CONFIG.RASTER_UPLOAD_API}/upload/save`}
                headers={{authorization: `Bearer ${MAPHUBS_CONFIG.RASTER_UPLOAD_API_KEY}`}}
                note='Supports: GeoTiffs and MBTiles, GeoTiffs must have RGB visual bands'
                maxFileSize={52428800}
                allowedFileTypes={['.tif', '.tiff', '.mbtiles']}
                meta={{layer_id}}
                onProcessingStart={this.onProcessingStart}
                onComplete={this.onUpload}
                onError={this.onUploadError}
              />
            </div>
          </div>
          <div className='row'>
            {(canSubmit && style) &&
              <div ref='mapSection'>
                <p>{t('Please review the data on the map to confirm the upload was successful.')}</p>
                <Map style={{width: '100%', height: '400px'}}
                  id='upload-preview-map'
                  showFeatureInfoEditButtons={false}
                  mapConfig={mapConfig}
                  glStyle={style}
                  fitBounds={bbox}
                  primaryColor={MAPHUBS_CONFIG.primaryColor}
                  logoSmall={MAPHUBS_CONFIG.logoSmall}
                  logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                  logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
                  t={this.t}
                />
              </div>
            }
          </div>
        </div>
        <div className='right'>
          <button className='waves-effect waves-light btn' disabled={!canSubmit} onClick={this.onSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</button>
        </div>
      </div>
    )
  }
}
