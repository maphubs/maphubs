// @flow
import React from 'react'
import UppyFileUpload from '../forms/UppyFileUpload'
import Map from '../Map'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'
import superagent from 'superagent'
import { Row, message, notification, Button } from 'antd'
// import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
// const debug = DebugService('UploadLocalSource')
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

let scrollToComponent

type Props = {|
  onSubmit: Function,
  mapConfig: Object
|}

type State = {
  canSubmit: boolean,
  bbox?: Object
} & LocaleStoreState & LayerStoreState

export default class UploadRasterSource extends MapHubsComponent<Props, State> {
  state: State = {
    canSubmit: false,
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
    const closeMessage = message.loading(t('Processing'), 0)
    superagent.post(`${MAPHUBS_CONFIG.RASTER_UPLOAD_API}/upload/complete`)
      .set({'Content-Type': 'application/json', Authorization: 'Bearer ' + MAPHUBS_CONFIG.RASTER_UPLOAD_API_KEY})
      .accept('json')
      .send({
        uploadUrl: file.uploadURL,
        originalName: file.data.name
      })
      .end((err, res) => {
        closeMessage()
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
              notification.error({
                message: t('Error'),
                description: err.message || err.toString() || err,
                duration: 0
              })
            } else {
              // reset style to load correct source
              LayerActions.resetStyle()
              // tell the map that the data is initialized
              LayerActions.tileServiceInitialized()
              this.setState({canSubmit: true, bbox: result.bounds})
            }
          })
        }
      })
  }

  onUploadError = (err: string) => {
    const {t} = this
    notification.error({
      message: t('Error'),
      description: err,
      duration: 0
    })
  }

  render () {
    const {t} = this
    const layer_id = this.state.layer_id ? this.state.layer_id : 0
    const { canSubmit, style, bbox } = this.state
    const {mapConfig} = this.props

    return (
      <Row>
        <style jsx>{`
          #upload-process-progess {
            z-index: 9999 !important;
          }
        `}
        </style>
        <div>
          <Row style={{marginBottom: '20px'}}>
            <div style={{margin: 'auto auto', maxWidth: '750px'}}>
              <UppyFileUpload
                endpoint={`${MAPHUBS_CONFIG.RASTER_UPLOAD_API}/upload/save`}
                headers={{authorization: `Bearer ${MAPHUBS_CONFIG.RASTER_UPLOAD_API_KEY}`}}
                note='Supports: GeoTiffs and MBTiles, GeoTiffs must have RGB visual bands'
                maxFileSize={MAPHUBS_CONFIG.RASTER_UPLOAD_FILE_SIZE_LIMIT || 157286400}
                allowedFileTypes={['.tif', '.tiff', '.mbtiles']}
                meta={{layer_id}}
                onComplete={this.onUpload}
                onError={this.onUploadError}
              />
            </div>
          </Row>
          <Row style={{marginBottom: '20px'}}>
            {(canSubmit && style) &&
              <div ref='mapSection'>
                <p>{t('Please review the data on the map to confirm the upload was successful.')}</p>
                <Map
                  style={{width: '100%', height: '400px'}}
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
                  locale={this.state.locale}
                  mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
                  DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
                  earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
                />
              </div>}
          </Row>
        </div>
        <div style={{float: 'right'}}>
          <Button type='primary' disabled={!canSubmit} onClick={this.onSubmit}>{t('Save and Continue')}</Button>
        </div>
      </Row>
    )
  }
}
