// @flow
import type {Node} from "React";import React from 'react'
import FileUpload from '../forms/FileUpload'
import Map from '../Map'
import { message, notification, Row, Button } from 'antd'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'
import type {GeoJSONObject} from 'geojson-flow'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

let scrollToComponent

type Props = {|
  onSubmit: Function,
  layerDataType: string,
  mapConfig: Object
|}

type State = {
  canSubmit: boolean,
  geoJSON?: GeoJSONObject,
  largeData: boolean
} & LocaleStoreState & LayerStoreState

export default class UploadLayerReplacement extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    canSubmit: false,
    largeData: false
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  componentDidMount () {
    scrollToComponent = require('react-scroll-to-component')
  }

  componentDidUpdate () {
    if (this.state.geoJSON) {
      scrollToComponent(this.refs.mapSection)
    }
  }

  enableButton: any | (() => void) = () => {
    this.setState({
      canSubmit: true
    })
  }

  disableButton: any | (() => void) = () => {
    this.setState({
      canSubmit: false
    })
  }

  onSubmit: any | (() => void) = () => {
    const {t} = this
    const _this = this

    LayerActions.submitPresets(false, _this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        LayerActions.replaceData(_this.state._csrf, (err) => {
          if (err) {
            notification.error({
              message: t('Server Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            message.success(t('Layer Saved'), 1, _this.props.onSubmit)
          }
        })
      }
    })
  }

  onUpload: any | ((result: any) => void) = (result: Object) => {
    if (result.success) {
      this.setState({geoJSON: result.geoJSON, canSubmit: true, largeData: result.largeData})
      // LayerActions.setDataType(result.data_type);
      LayerActions.mergeNewPresetTags(result.uniqueProps)
      // LayerActions.setImportedTags(result.uniqueProps,  true);
    }
    this.closeMessage()
  }

  onProcessingStart: any | (() => void) = () => {
    this.closeMessage = message.loading(this.t('Processing'), 0)
  }

  render (): Node {
    const {t} = this
    const layer_id = this.state.layer_id ? this.state.layer_id : 0
    const url = `/api/layer/${layer_id}/replace`
    let largeDataMessage = ''
    if (this.state.largeData) {
      largeDataMessage = (
        <p>{t('Data Upload Successful: Large dataset detected, you will be able to view the data after it is saved.')}</p>
      )
    }
    let map = ''
    if (this.state.geoJSON) {
      map = (
        <div ref='mapSection'>
          <p>{t('Please review the data on the map to confirm the upload was successful.')}</p>
          <Map
            style={{width: '100%', height: '400px'}}
            id='upload-preview-map' t={this.t}
            showFeatureInfoEditButtons={false}
            mapConfig={this.props.mapConfig}
            primaryColor={MAPHUBS_CONFIG.primaryColor}
            logoSmall={MAPHUBS_CONFIG.logoSmall}
            logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
            logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
            data={this.state.geoJSON}
            locale={this.state.locale}
            mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
            DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
            earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
          />
        </div>
      )
    }

    return (
      <Row>
        <Row style={{marginBottom: '20px'}}>
          <p>{t('Upload File: Shapefile(Zip), GeoJSON, KML, GPX (tracks or waypoints), or CSV (with Lat/Lon fields)')}</p>
          <Row style={{marginBottom: '20px'}}>
            <FileUpload onUpload={this.onUpload} action={url} t={t} />
          </Row>
          <Row style={{marginBottom: '20px'}}>
            {largeDataMessage}
            {map}
          </Row>
        </Row>
        <Row style={{marginBottom: '20px'}}>
          <Button type='primary' disabled={!this.state.canSubmit} onClick={this.onSubmit}>{t('Replace Layer Data')}</Button>
        </Row>
      </Row>
    )
  }
}
