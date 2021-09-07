import React, { useState, useEffect } from 'react'
import UppyFileUpload from '../forms/UppyFileUpload'
import { Row, notification, message, Button } from 'antd'
import { Element, scroller } from 'react-scroll'
import superagent from 'superagent'
import useT from '../../hooks/useT'

import dynamic from 'next/dynamic'

import { useDispatch, useSelector } from '../../redux/hooks'
import LayerAPI from '../../redux/reducers/layer-api'
import {
  saveDataSettings,
  setDataType,
  setImportedTags
} from '../../redux/reducers/layerSlice'
import MapProvider from '../Maps/redux/MapProvider'

const MapHubsMap = dynamic(() => import('../Maps/Map'), {
  ssr: false
})

type Props = {
  onSubmit: () => void
  mapConfig: Record<string, any>
}

const UploadLocalSource = ({ onSubmit, mapConfig }: Props): JSX.Element => {
  const [canSubmit, setCanSubmit] = useState(false)
  const [bbox, setBBOX] = useState()
  const { t, locale } = useT()

  const dispatch = useDispatch()
  const layer_id = useSelector((state) => state.layer.layer_id)
  const style = useSelector((state) => state.layer.style)

  useEffect(() => {
    scroller.scrollTo('scrollToMap')
  }, [])

  const submit = async (): Promise<void> => {
    const data = {
      is_external: false,
      external_layer_type: '',
      external_layer_config: {}
    }
    try {
      await LayerAPI.saveDataSettings(layer_id, data)
      dispatch(saveDataSettings(data))
      message.success(t('Layer Saved'), 1, onSubmit)
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString(),
        duration: 0
      })
    }
  }
  const onUpload = async (file: Record<string, any>) => {
    const closeMessage = message.loading(t('Processing'), 0)

    try {
      const response = await fetch('/api/layer/complete/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uploadUrl: file.uploadURL,
          layer_id,
          originalName: file.data.name
        })
      })

      const result = await response.json()

      if (result.success) {
        dispatch(setDataType(result.data_type))
        dispatch(setImportedTags({ data: result.uniqueProps, initLayer: true }))
        setBBOX(result.bbox)
        setCanSubmit(true)
      } else {
        notification.error({
          message: t('Error'),
          description: result.error || 'Unknown Error',
          duration: 0
        })
      }
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString(),
        duration: 0
      })
    } finally {
      closeMessage()
    }
  }

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
        <MapProvider>
          <MapHubsMap
            id='upload-preview-map'
            showFeatureInfoEditButtons={false}
            mapConfig={mapConfig}
            initialGLStyle={style}
            fitBounds={bbox}
            locale={locale}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
            earthEngineClientID={process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID}
          />
        </MapProvider>
      </div>
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
            endpoint='/api/layer/upload/file'
            note='Supported files: Shapefile (Zip), GeoJSON, KML,  GPX (tracks or waypoints), or CSV (with Lat/Lon fields), and MapHubs format'
            layer_id={layer_id || 0}
            onComplete={onUpload}
            onError={(err) => {
              notification.error({
                message: t('Error'),
                description: err.message || 'Unknown Error',
                duration: 0
              })
            }}
          />
        </div>
      </Row>
      <Row justify='center' style={{ height: '450px' }}>
        <Element name='scrollToMap' style={{ width: '100%' }}>
          <Row
            style={{
              marginBottom: '10px'
            }}
          >
            {map}
          </Row>
        </Element>
      </Row>
      <Row justify='end'>
        <Button type='primary' disabled={!canSubmit} onClick={submit}>
          {t('Save and Continue')}
        </Button>
      </Row>
    </Row>
  )
}
export default UploadLocalSource
