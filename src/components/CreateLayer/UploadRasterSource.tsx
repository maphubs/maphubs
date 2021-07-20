import React, { useState, useEffect } from 'react'
import UppyFileUpload from '../forms/UppyFileUpload'
import Map from '../Map'
import { Element, scroller } from 'react-scroll'
import LayerActions from '../../actions/LayerActions'
import superagent from 'superagent'
import { Row, message, notification, Button } from 'antd'
import useT from '../../hooks/useT'
import { useSelector } from 'react-redux'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  onSubmit: () => void
  mapConfig: Record<string, any>
}
const UploadRasterSource = ({ onSubmit, mapConfig }: Props): JSX.Element => {
  const [canSubmit, setCanSubmit] = useState(false)
  const [bbox, setBBOX] = useState()
  const { t, locale } = useT()

  const layer = useSelector((state: { layer: any }) => state.layer)
  const { layer_id, style } = layer

  useEffect(() => {
    scroller.scrollTo('scrollToMap')
  }, [])

  const submit = (): void => {
    message.success(t('Layer Saved'))
    onSubmit()
  }

  const onUpload = (file: Record<string, any>): void => {
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
                // set local state
                setBBOX(result.bounds)
                setCanSubmit(true)
              }
            }
          )
        }
      })
  }
  const onUploadError = (err: string): void => {
    notification.error({
      message: t('Error'),
      description: err,
      duration: 0
    })
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
              MAPHUBS_CONFIG.RASTER_UPLOAD_FILE_SIZE_LIMIT || 157_286_400
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
          <Element name='scrollToMap'>
            <div
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
          </Element>
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
export default UploadRasterSource
