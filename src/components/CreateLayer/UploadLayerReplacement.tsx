import React, { useState, useEffect } from 'react'
import FileUpload from '../forms/FileUpload'
import { message, notification, Row, Button } from 'antd'
import LayerActions from '../../actions/LayerActions'
import { Element, scroller } from 'react-scroll'
import type { FeatureCollection } from 'geojson'
import useT from '../../hooks/useT'
import { useSelector } from 'react-redux'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'

const MapHubsMap = dynamic(() => import('../Map'), {
  ssr: false
})

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
  onSubmit: (...args: Array<any>) => void
  mapConfig: Record<string, any>
}

const UploadLayerReplacement = ({
  onSubmit,
  mapConfig
}: Props): JSX.Element => {
  const [canSubmit, setCanSubmit] = useState(false)
  const [geoJSON, setGeoJSON] = useState<FeatureCollection>()
  const { t, locale } = useT()

  const layer_id = useSelector((state: { layer: any }) => state.layer.layer_id)

  useEffect(() => {
    scroller.scrollTo('scrollToMap')
  }, [])

  const submit = (): void => {
    LayerActions.submitPresets(false, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        LayerActions.replaceData((err) => {
          if (err) {
            notification.error({
              message: t('Server Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            message.success(t('Layer Saved'), 1, onSubmit)
          }
        })
      }
    })
  }
  const onUpload = (result: Record<string, any>): void => {
    if (result.success) {
      setGeoJSON(result.geoJSON)
      setCanSubmit(true)
      // LayerActions.setDataType(result.data_type);
      LayerActions.mergeNewPresetTags(result.uniqueProps) // LayerActions.setImportedTags(result.uniqueProps,  true);
    }

    message.destroy('processing')
  }
  const onProcessingStart = (): void => {
    message.loading({
      constent: t('Processing'),
      duration: 0,
      key: 'processing'
    })
  }

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
          {geoJSON && (
            <Element name='scrollToMap'>
              <div>
                <p>
                  {t(
                    'Please review the data on the map to confirm the upload was successful.'
                  )}
                </p>
                <MapHubsMap
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
            </Element>
          )}
        </Row>
      </Row>
      <Row
        style={{
          marginBottom: '20px'
        }}
      >
        <Button type='primary' disabled={!canSubmit} onClick={submit}>
          {t('Replace Layer Data')}
        </Button>
      </Row>
    </Row>
  )
}
export default UploadLayerReplacement
