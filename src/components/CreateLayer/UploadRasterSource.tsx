import React from 'react'
import UppyFileUpload from '../forms/UppyFileUpload'
import Map from '../Map'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'

import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { LayerStoreState } from '../../stores/layer-store'
import superagent from 'superagent'
import { Row, message, notification, Button } from 'antd'
// import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
// const debug = DebugService('UploadLocalSource')
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
let scrollToComponent
type Props = {
  onSubmit: (...args: Array<any>) => any
  mapConfig: Record<string, any>
}
type State = {
  canSubmit: boolean
  bbox?: Record<string, any>
} & LocaleStoreState &
  LayerStoreState
export default class UploadRasterSource extends React.Component<Props, State> {
  state: State = {
    canSubmit: false,
    layer: {}
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
    if (this.state.canSubmit) {
      scrollToComponent(this.refs.mapSection)
    }
  }

  onSubmit = (): void => {
    const { t, props } = this
    message.success(t('Layer Saved'))
    props.onSubmit()
  }
  onUpload = (file: Record<string, any>): void => {
    const { t, state, onUploadError } = this

    const closeMessage = message.loading(t('Processing'), 0)
    superagent
      .post(`${MAPHUBS_CONFIG.RASTER_UPLOAD_API}/upload/complete`)
      .set({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + MAPHUBS_CONFIG.RASTER_UPLOAD_API_KEY
      })
      .accept('json')
      .send({
        uploadUrl: file.uploadURL,
        originalName: file.data.name
      })
      .end((err, res) => {
        closeMessage()

        if (err) {
          onUploadError(err)
        } else {
          const result = res.body
          LayerActions.saveDataSettings(
            {
              is_external: true,
              external_layer_type: 'Raster Tile Service',
              external_layer_config: {
                type: 'raster',
                minzoom: Number.parseInt(result.minzoom, 10),
                maxzoom: Number.parseInt(result.maxzoom, 10),
                bounds: result.bounds,
                tiles: result.tiles,
                scheme: result.scheme
              }
            },
            state._csrf,
            (err) => {
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
                this.setState({
                  canSubmit: true,
                  bbox: result.bounds
                })
              }
            }
          )
        }
      })
  }
  onUploadError = (err: string): void => {
    const { t } = this
    notification.error({
      message: t('Error'),
      description: err,
      duration: 0
    })
  }

  render(): JSX.Element {
    const { t, props, state, onUpload, onUploadError, onSubmit } = this
    const { canSubmit, style, bbox, locale, layer_id } = state
    const { mapConfig } = props
    return (
      <Row>
        <style jsx>
          {`
            #upload-process-progess {
              z-index: 9999 !important;
            }
          `}
        </style>
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              margin: 'auto auto',
              maxWidth: '750px'
            }}
          >
            <UppyFileUpload
              endpoint={`${MAPHUBS_CONFIG.RASTER_UPLOAD_API}/upload/save`}
              headers={{
                authorization: `Bearer ${MAPHUBS_CONFIG.RASTER_UPLOAD_API_KEY}`
              }}
              note='Supports: GeoTiffs and MBTiles, GeoTiffs must have RGB visual bands'
              maxFileSize={
                MAPHUBS_CONFIG.RASTER_UPLOAD_FILE_SIZE_LIMIT || 157286400
              }
              allowedFileTypes={['.tif', '.tiff', '.mbtiles']}
              meta={{
                layer_id: layer_id || 0
              }}
              onComplete={onUpload}
              onError={onUploadError}
            />
          </div>
        </Row>
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          {canSubmit && style && (
            <div
              ref='mapSection'
              style={{
                width: '100%'
              }}
            >
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
                showFeatureInfoEditButtons={false}
                mapConfig={mapConfig}
                glStyle={style}
                fitBounds={bbox}
                primaryColor={MAPHUBS_CONFIG.primaryColor}
                logoSmall={MAPHUBS_CONFIG.logoSmall}
                logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
                t={t}
                locale={locale}
                mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
                DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
                earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
              />
            </div>
          )}
        </Row>
        <Row justify='end'>
          <Button type='primary' disabled={!canSubmit} onClick={onSubmit}>
            {t('Save and Continue')}
          </Button>
        </Row>
      </Row>
    )
  }
}
