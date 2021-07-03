import React from 'react'
import UppyFileUpload from '../forms/UppyFileUpload'
import { Row, notification, message, Button } from 'antd'
import Map from '../Map'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import RadioModal from '../RadioModal'

import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { LayerStoreState } from '../../stores/layer-store'
import superagent from 'superagent'
// import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
// const debug = DebugService('UploadLocalSource')
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
let scrollToComponent
type Props = {
  onSubmit: (...args: Array<any>) => void
  mapConfig: Record<string, any>
}
type State = {
  canSubmit: boolean
  largeData: boolean
  multipleShapefiles?: any
  bbox?: Record<string, any>
} & LocaleStoreState &
  LayerStoreState
export default class UploadLocalSource extends React.Component<Props, State> {
  props: Props
  state: State = {
    canSubmit: false,
    largeData: false,
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

    if (this.state.multipleShapefiles) {
      this.refs.chooseshape.show()
    }
  }

  onSubmit = (): void => {
    const { t, props, state } = this
    const { _csrf } = state
    const { onSubmit } = props

    const data = {
      is_external: false,
      external_layer_type: '',
      external_layer_config: {}
    }
    LayerActions.saveDataSettings(data, _csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString(),
          duration: 0
        })
      } else {
        message.success(t('Layer Saved'), 1, onSubmit)
      }
    })
  }
  onUpload = (file: Record<string, any>): void => {
    const { t, state, onUploadError, setState } = this

    const { layer_id } = state
    const closeMessage = message.loading(t('Processing'), 0)
    superagent
      .post('/api/layer/complete/upload')
      .type('json')
      .accept('json')
      .send({
        uploadUrl: file.uploadURL,
        layer_id,
        originalName: file.data.name
      })
      .end((err, res) => {
        closeMessage()

        if (err) {
          onUploadError(err)
        } else {
          const result = res.body

          if (result.success) {
            LayerActions.setDataType(result.data_type)
            LayerActions.setImportedTags(result.uniqueProps, true)
            setState({
              canSubmit: true,
              bbox: result.bbox
            })
          } else {
            if (result.code === 'MULTIPLESHP') {
              setState({
                multipleShapefiles: result.shapefiles
              })
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
  onUploadError: any | ((err: string) => void) = (err: string) => {
    const { t } = this
    notification.error({
      message: t('Server Error'),
      description: err,
      duration: 0
    })
  }
  finishUpload = (shapefileName: string): void => {
    const { t, state, setState } = this
    const { _csrf } = state
    LayerActions.finishUpload(shapefileName, _csrf, (err, result) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else if (result.success) {
        LayerActions.setDataType(result.data_type)
        LayerActions.setImportedTags(result.uniqueProps, true)

        setState({
          canSubmit: true,
          multipleShapefiles: undefined
        })
      } else {
        notification.error({
          message: t('Error'),
          description: result.error || 'Unknown Error',
          duration: 0
        })
      }
    })
  }

  render(): JSX.Element {
    const { t, props, state, onUpload, onUploadError, onSubmit, finishUpload } =
      this

    const { canSubmit, multipleShapefiles, style, bbox, layer_id, locale } =
      state
    const { mapConfig } = props

    /*
    let mapExtent
    if (bbox) {
      const bbox = preview_position.bbox
      mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
    }
    */
    let map = <></>

    if (canSubmit && style) {
      map = (
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
      )
    }

    let multipleShapefilesDisplay = <></>

    if (multipleShapefiles) {
      const options = []
      for (const shpFile of multipleShapefiles) {
        options.push({
          value: shpFile,
          label: shpFile
        })
      }
      multipleShapefilesDisplay = (
        <RadioModal
          ref='chooseshape'
          title={t('Multiple Shapefiles Found - Please Select One')}
          options={options}
          onSubmit={finishUpload}
          t={t}
        />
      )
    }

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
            marginBottom: '10px'
          }}
        >
          <div
            style={{
              margin: 'auto auto',
              maxWidth: '750px'
            }}
          >
            <UppyFileUpload
              endpoint='/api/layer/upload'
              note='Supported files: Shapefile (Zip), GeoJSON, KML,  GPX (tracks or waypoints), or CSV (with Lat/Lon fields), and MapHubs format'
              layer_id={layer_id || 0}
              onComplete={onUpload}
              onError={onUploadError}
            />
          </div>
        </Row>
        <Row
          style={{
            marginBottom: '10px'
          }}
        >
          {map}
        </Row>
        {multipleShapefilesDisplay}
        <Row justify='end'>
          <Button type='primary' disabled={!canSubmit} onClick={onSubmit}>
            {t('Save and Continue')}
          </Button>
        </Row>
      </Row>
    )
  }
}
