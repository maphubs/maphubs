// @flow
import React from 'react'
import UppyFileUpload from '../forms/UppyFileUpload'
import { Row, notification, message, Button } from 'antd'
import Map from '../Map'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import RadioModal from '../RadioModal'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'
import superagent from 'superagent'
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
  largeData: boolean,
  multipleShapefiles?: any,
  bbox?: Object
} & LocaleStoreState & LayerStoreState

export default class UploadLocalSource extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    canSubmit: false,
    largeData: false,
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
    if (this.state.multipleShapefiles) {
      this.refs.chooseshape.show()
    }
  }

  onSubmit = () => {
    const {t} = this
    const _this = this
    const data = {
      is_external: false,
      external_layer_type: '',
      external_layer_config: {}
    }

    LayerActions.saveDataSettings(data, _this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString(),
          duration: 0
        })
      } else {
        message.success(t('Layer Saved'), 1, _this.props.onSubmit)
      }
    })
  }

  onUpload = (file: Object) => {
    const {t} = this
    const _this = this
    const {layer_id} = this.state
    const closeMessage = message.loading(t('Processing'), 0)
    superagent.post('/api/layer/complete/upload')
      .type('json').accept('json')
      .send({
        uploadUrl: file.uploadURL,
        layer_id,
        originalName: file.data.name
      })
      .end((err, res) => {
        closeMessage()
        if (err) {
          _this.onUploadError(err)
        } else {
          const result = res.body
          if (result.success) {
            LayerActions.setDataType(result.data_type)
            LayerActions.setImportedTags(result.uniqueProps, true)
            this.setState({canSubmit: true, bbox: result.bbox})
          } else {
            if (result.code === 'MULTIPLESHP') {
              this.setState({multipleShapefiles: result.shapefiles})
            } else {
              notification.error({
                message: t('Error'),
                description: result.error || 'Unknown Error',
                duration: 0
              })
            }
          }
        }
      })
  }

  onUploadError = (err: string) => {
    const {t} = this
    notification.error({
      message: t('Server Error'),
      description: err,
      duration: 0
    })
  }

  finishUpload = (shapefileName: string) => {
    const _this = this
    const {t} = this
    LayerActions.finishUpload(shapefileName, this.state._csrf, (err, result) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else if (result.success) {
        LayerActions.setDataType(result.data_type)
        LayerActions.setImportedTags(result.uniqueProps, true)
        _this.setState({canSubmit: true, multipleShapefiles: null})
      } else {
        notification.error({
          message: t('Error'),
          description: result.error || 'Unknown Error',
          duration: 0
        })
      }
    })
  }

  render () {
    const {t} = this
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
        <RadioModal
          ref='chooseshape' title={t('Multiple Shapefiles Found - Please Select One')}
          options={options} onSubmit={this.finishUpload} t={t}
        />
      )
    }

    return (
      <Row>
        <style jsx>{`
          #upload-process-progess {
            z-index: 9999 !important;
          }
        `}
        </style>
        <Row style={{marginBottom: '10px'}}>
          <div style={{margin: 'auto auto', maxWidth: '750px'}}>
            <UppyFileUpload
              endpoint='/api/layer/upload'
              note='Supported files: Shapefile (Zip), GeoJSON, KML,  GPX (tracks or waypoints), or CSV (with Lat/Lon fields), and MapHubs format'
              layer_id={layer_id}
              onComplete={this.onUpload}
              onError={this.onUploadError}
            />
          </div>
        </Row>
        <Row style={{marginBottom: '10px'}}>
          {map}
        </Row>
        {multipleShapefilesDisplay}
        <div style={{float: 'right'}}>
          <Button type='primary' disabled={!canSubmit} onClick={this.onSubmit}>{t('Save and Continue')}</Button>
        </div>
      </Row>
    )
  }
}
