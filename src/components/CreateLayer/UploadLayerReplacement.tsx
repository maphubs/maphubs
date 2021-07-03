import React from 'react'
import FileUpload from '../forms/FileUpload'
import Map from '../Map'
import { message, notification, Row, Button } from 'antd'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'

import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { LayerStoreState } from '../../stores/layer-store'
import type { GeoJSONObject } from 'geojson-flow'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
let scrollToComponent
type Props = {
  onSubmit: (...args: Array<any>) => void
  layerDataType: string
  mapConfig: Record<string, any>
}
type State = {
  canSubmit: boolean
  geoJSON?: GeoJSONObject
  largeData: boolean
} & LocaleStoreState &
  LayerStoreState
export default class UploadLayerReplacement extends React.Component<
  Props,
  State
> {
  props: Props
  state: State = {
    canSubmit: false,
    largeData: false
  }
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [LayerStore]
  }

  componentDidMount(): void {
    scrollToComponent = require('react-scroll-to-component')
  }

  componentDidUpdate(): void {
    if (this.state.geoJSON) {
      scrollToComponent(this.refs.mapSection)
    }
  }

  enableButton = (): void => {
    this.setState({
      canSubmit: true
    })
  }
  disableButton = (): void => {
    this.setState({
      canSubmit: false
    })
  }
  onSubmit = (): void => {
    const { t } = this

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
  onUpload: any | ((result: any) => void) = (result: Record<string, any>) => {
    if (result.success) {
      this.setState({
        geoJSON: result.geoJSON,
        canSubmit: true,
        largeData: result.largeData
      })
      // LayerActions.setDataType(result.data_type);
      LayerActions.mergeNewPresetTags(result.uniqueProps) // LayerActions.setImportedTags(result.uniqueProps,  true);
    }

    this.closeMessage()
  }
  onProcessingStart: any | (() => void) = () => {
    this.closeMessage = message.loading(this.t('Processing'), 0)
  }

  render(): JSX.Element {
    const { t, props, state, onSubmit, onUpload } = this
    const { mapConfig } = props
    const { largeData, layer_id, geoJSON, canSubmit, locale } = state
    const url = `/api/layer/${layer_id || 0}/replace`

    return (
      <Row>
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <p>
            {t(
              'Upload File: Shapefile(Zip), GeoJSON, KML, GPX (tracks or waypoints), or CSV (with Lat/Lon fields)'
            )}
          </p>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <FileUpload onUpload={onUpload} action={url} t={t} />
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            {largeData && (
              <p>
                {t(
                  'Data Upload Successful: Large dataset detected, you will be able to view the data after it is saved.'
                )}
              </p>
            )}
            {geoJSON && (
              <div ref='mapSection'>
                <p>
                  {t(
                    'Please review the data on the map to confirm the upload was successful.'
                  )}
                </p>
                <Map
                  style={{
                    width: '100%',
                    height: '400px'
                  }}
                  id='upload-preview-map'
                  t={t}
                  showFeatureInfoEditButtons={false}
                  mapConfig={mapConfig}
                  primaryColor={MAPHUBS_CONFIG.primaryColor}
                  logoSmall={MAPHUBS_CONFIG.logoSmall}
                  logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                  logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
                  data={geoJSON}
                  locale={locale}
                  mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
                  DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
                  earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
                />
              </div>
            )}
          </Row>
        </Row>
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <Button type='primary' disabled={!canSubmit} onClick={onSubmit}>
            {t('Replace Layer Data')}
          </Button>
        </Row>
      </Row>
    )
  }
}
