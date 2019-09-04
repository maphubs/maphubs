// @flow
import React from 'react'
import FileUpload from '../forms/FileUpload'
import Map from '../Map'
import { message, notification } from 'antd'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import RadioModal from '../RadioModal'
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
  largeData: boolean,
  multipleShapefiles: any
} & LocaleStoreState & LayerStoreState

export default class UploadLayerReplacement extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    canSubmit: false,
    largeData: false,
    multipleShapefiles: null
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
    if (this.state.multipleShapefiles) {
      this.refs.chooseshape.show()
    }
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    })
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    })
  }

  onSubmit = () => {
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

  onUpload = (result: Object) => {
    const {t} = this

    if (result.success) {
      this.setState({geoJSON: result.geoJSON, canSubmit: true, largeData: result.largeData})
      // LayerActions.setDataType(result.data_type);
      LayerActions.mergeNewPresetTags(result.uniqueProps)
      // LayerActions.setImportedTags(result.uniqueProps,  true);
    } else {
      if (result.code === 'MULTIPLESHP') {
        this.setState({multipleShapefiles: result.shapefiles})
      } else {
        notification.error({
          message: t('Server Error'),
          description: result.error,
          duration: 0
        })
      }
    }
    this.closeMessage()
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
    const {t} = this
    const _this = this
    LayerActions.finishUpload(shapefileName, this.state._csrf, (err, result) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else if (result.success) {
        _this.setState({geoJSON: result.geoJSON, canSubmit: true, multipleShapefiles: null})
        LayerActions.setDataType(result.data_type)
        LayerActions.setImportedTags(result.uniqueProps, true)
      } else {
        notification.error({
          message: t('Error'),
          description: result.error,
          duration: 0
        })
      }
    })
  }

  onProcessingStart = () => {
    this.closeMessage = message.loading(this.t('Processing'), 0)
  }

  render () {
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

    let multipleShapefiles = ''
    if (this.state.multipleShapefiles) {
      const options = []
      this.state.multipleShapefiles.forEach((shpFile) => {
        options.push({value: shpFile, label: shpFile})
      })
      multipleShapefiles = (
        <RadioModal
          ref='chooseshape' title={t('Multiple Shapefiles Found - Please Select One')}
          options={options} onSubmit={this.finishUpload} t={t}
        />
      )
    }

    return (
      <div className='row'>
        <div>
          <p>{t('Upload File: Shapefile(Zip), GeoJSON, KML, GPX (tracks or waypoints), or CSV (with Lat/Lon fields)')}</p>
          <div className='row'>
            <FileUpload onUpload={this.onUpload} onFinishTx={this.onProcessingStart} onError={this.onUploadError} action={url} />
          </div>
          <div className='row'>
            {largeDataMessage}
            {map}
          </div>
          {multipleShapefiles}
        </div>
        <div className='right'>
          <button className='waves-effect waves-light btn' disabled={!this.state.canSubmit} onClick={this.onSubmit}><i className='material-icons right'>arrow_forward</i>{t('Replace Layer Data')}</button>
        </div>
      </div>
    )
  }
}
