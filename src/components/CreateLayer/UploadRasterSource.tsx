import React, { useState, useEffect } from 'react'
import UppyFileUpload from '../forms/UppyFileUpload'
import { Element, scroller } from 'react-scroll'
import superagent from 'superagent'
import { Row, message, notification, Button } from 'antd'
import useT from '../../hooks/useT'

import dynamic from 'next/dynamic'

import { useDispatch, useSelector } from '../../redux/hooks'
import LayerAPI from '../../redux/reducers/layer-api'
import {
  saveDataSettings,
  resetStyle,
  tileServiceInitialized
} from '../../redux/reducers/layerSlice'
import { Layer } from '../../types/layer'

const MapHubsMap = dynamic(() => import('../Maps/Map'), {
  ssr: false
})

type Props = {
  onSubmit: () => void
  mapConfig: Record<string, any>
}
const UploadRasterSource = ({ onSubmit, mapConfig }: Props): JSX.Element => {
  const [canSubmit, setCanSubmit] = useState(false)
  const [bbox, setBBOX] = useState()
  const { t, locale } = useT()
  const dispatch = useDispatch()
  const layer_id = useSelector((state) => state.layer.layer_id)
  const style = useSelector((state) => state.layer.style)

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
      .post(`${process.env.NEXT_PUBLIC_RASTER_UPLOAD_API}/upload/complete`)
      .set({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_RASTER_UPLOAD_API_KEY
      })
      .accept('json')
      .send({
        uploadUrl: file.uploadURL,
        originalName: file.data.name
      })
      .end(async (err, res) => {
        closeMessage()

        if (err) {
          onUploadError(err)
        } else {
          const result = res.body
          const dataSettings = {
            is_external: true,
            external_layer_type: 'Raster Tile Service',
            external_layer_config: {
              type: 'raster' as Layer['external_layer_config']['type'],
              minzoom: Number.parseInt(result.minzoom, 10),
              maxzoom: Number.parseInt(result.maxzoom, 10),
              bounds: result.bounds,
              tiles: result.tiles,
              scheme: result.scheme
            }
          }
          try {
            await LayerAPI.saveDataSettings(layer_id, dataSettings)
            // save in store
            dispatch(saveDataSettings(dataSettings))
            // reset style to load correct source
            dispatch(resetStyle())
            // tell the map that the data is initialized
            dispatch(tileServiceInitialized())
            // set local state
            setBBOX(result.bounds)
            setCanSubmit(true)
          } catch (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          }
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
            endpoint={`${process.env.NEXT_PUBLIC_RASTER_UPLOAD_API}/upload/save`}
            headers={{
              authorization: `Bearer ${process.env.NEXT_PUBLIC_RASTER_UPLOAD_API_KEY}`
            }}
            note='Supports: GeoTiffs and MBTiles, GeoTiffs must have RGB visual bands'
            maxFileSize={
              process.env.NEXT_PUBLIC_RASTER_UPLOAD_FILE_SIZE_LIMIT ||
              157_286_400
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
                width: '100%',
                height: '400px'
              }}
            >
              <p>
                {t(
                  'Please review the data on the map to confirm the upload was successful.'
                )}
              </p>
              <MapHubsMap
                id='upload-preview-map'
                showFeatureInfoEditButtons={false}
                mapConfig={mapConfig}
                initialGLStyle={style}
                fitBounds={bbox}
                locale={locale}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
                earthEngineClientID={
                  process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID
                }
              />
            </div>
          </Element>
        )}
      </Row>
      <Row justify='end'>
        <Button type='primary' disabled={!canSubmit} onClick={submit}>
          {t('Save and Continue')}
        </Button>
      </Row>
    </Row>
  )
}
export default UploadRasterSource
