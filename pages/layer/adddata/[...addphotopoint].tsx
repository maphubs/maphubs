import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../src/components/Layout'
import DataCollectionForm from '../../../src/components/Maps/DataCollection/DataCollectionForm'
import ImageCrop from '../../../src/components/ImageCrop'
import GetNameField from '../../../src/components/Maps/Map/Styles/get-name-field'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import { Modal, message, notification, Row, Col, Button } from 'antd'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import useT from '../../../src/hooks/useT'
import useUnload from '../../../src/hooks/useUnload'
import useSWR from 'swr'
import useStickyResult from '../../../src/hooks/useStickyResult'
import { Layer } from '../../../src/types/layer'
import dynamic from 'next/dynamic'
import dms2dec from 'dms2dec'
import { FeatureCollection } from '@turf/helpers'
import _bbox from '@turf/bbox'
import request from 'superagent'
import moment from 'moment'
import { checkClientError } from '../../../src/services/client-error-response'

const MapHubsMap = dynamic(() => import('../../../src/components/Maps/Map'), {
  ssr: false
})

const { confirm } = Modal

const debug = DebugService('addphotopoint')

type AddPhotoPointStoreState = {
  image?: Record<string, any>
  imageInfo?: Record<string, any>
  geoJSON?: FeatureCollection
}

const AddPhotoPoint = (): JSX.Element => {
  const router = useRouter()
  const { t, locale } = useT()
  const [showImageCrop, setShowImageCrop] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [addPhotoPointState, setAddPhotoPointState] =
    useState<AddPhotoPointStoreState>({})

  const slug = router.query.addphotopoint || []
  const layer_id = slug[0]

  const { data } = useSWR([
    `
 {
   layer(id: "{id}") {
     layer_id
     name
     presets
   }
   allowedToModifyLayer(id: "{id}")
   mapConfig
 }
 `,
    layer_id
  ])
  const stickyData: {
    layer: Layer
    allowedToModifyLayer: boolean
    mapConfig: Record<string, unknown>
  } = useStickyResult(data) || {}
  const { layer, allowedToModifyLayer, mapConfig } = stickyData

  /*

  constructor(props: Props) {
    super(props)
    this.stores = [AddPhotoPointStore]

    Reflux.rehydrate(AddPhotoPointStore, {
      layer: props.layer
    })
    const baseMapContainerInit: {
      baseMap?: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
    } = {
      bingKey: process.env.NEXT_PUBLIC_BING_KEY,
      mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }

    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
  }
  */

  useUnload((e) => {
    e.preventDefault()
    if (!submitted) {
      const exit = confirm(t('Any pending changes will be lost'))
      if (exit) window.close()
    }
    window.close()
  })

  const resetPhoto = () => {
    setSubmitted(false)
    setShowImageCrop(true)
  }

  const setImage = (data: any, info: any, cb: any): void => {
    debug.log('set image')

    if (info && info.exif && info.exif.GPSLatitude) {
      const lat = info.exif.GPSLatitude
      const latRef = info.exif.GPSLatitudeRef
      const lon = info.exif.GPSLongitude
      const lonRef = info.exif.GPSLongitudeRef
      const geoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: dms2dec(lat, latRef, lon, lonRef).reverse()
            },
            properties: {}
          }
        ],
        bbox: undefined
      } as FeatureCollection

      const bbox = _bbox(geoJSON)

      debug.log(bbox)
      geoJSON.bbox = bbox

      // add optional exif metadata
      const properties = {
        photo_make: info.exif.Make,
        photo_model: info.exif.Model,
        photo_gps_altitude: info.exif.GPSAltitude,
        photo_gps_bearing: info.exif.GPSDestBearing,
        photo_timestamp: ''
      }

      if (info.exif.GPSDateStamp && info.exif.GPSTimeStamp) {
        const dateParts = info.exif.GPSDateStamp.split(':')
        const year = dateParts[0]
        const month = dateParts[1]
        const day = dateParts[2]
        const time = info.exif.GPSTimeStamp
        const hour = time[0]
        const minute = time[1]
        const second = time[2]
        const timestamp = moment()
          .year(year)
          .month(month)
          .date(day)
          .hour(hour)
          .minute(minute)
          .second(second)
          .format()
        properties.photo_timestamp = timestamp
      }

      geoJSON.features[0].properties = properties
      setAddPhotoPointState({
        image: data,
        imageInfo: info,
        geoJSON
      })
      cb(null)
    } else {
      // image does not contain GPS Location
      cb(new Error('Photo Missing GPS Information'))
    }
  }

  const submit = (fields: any) => {
    debug.log('submit photo point')
    const closeMessage = message.loading(t('Saving'), 0)

    const { geoJSON, image, imageInfo } = addPhotoPointState

    // save fields into geoJSON
    if (Array.isArray(geoJSON?.features) && geoJSON.features.length > 0) {
      const firstFeature = geoJSON.features[0]

      if (firstFeature) {
        for (const key of Object.keys(fields)) {
          const val = fields[key]

          if (firstFeature.properties) {
            firstFeature.properties[key] = val
          }
        }
      }
    }

    request
      .post('/api/layer/addphotopoint')
      .type('json')
      .accept('json')
      .send({
        layer_id: layer.layer_id,
        geoJSON: geoJSON,
        image,
        imageInfo
      })
      .end((err, res) => {
        checkClientError({
          res,
          err,
          onSuccess: () => {
            const { mhid, image_id, image_url } = res.body

            setSubmitted(true)

            closeMessage()

            if (err) {
              notification.error({
                message: t('Error'),
                description: err.message || err.toString() || err,
                duration: 0
              })
            } else {
              confirm({
                title: t('Photo Saved'),
                content: t('Do you want to add another photo?'),
                okText: t('Yes'),
                okType: 'primary',
                cancelText: t('No'),

                onOk() {
                  location.reload()
                },

                onCancel() {
                  let featureName = 'unknown'
                  const layerId: string = layer?.layer_id
                    ? layer.layer_id.toString()
                    : '0'

                  if (geoJSON && geoJSON.features) {
                    const features = geoJSON.features
                    const props = features[0].properties
                    const style = layer?.style || undefined
                    const presets = GetNameField.getPresetsFromStyle(style)
                    const nameField = GetNameField.getNameField(props, presets)

                    if (nameField) {
                      featureName = props[nameField]
                    }
                  }

                  if (mhid) {
                    const featureId = mhid.split(':')[1]

                    const featurePageUrl = `/feature/${layerId}/${featureId}/${featureName}`
                    router.push(featurePageUrl)
                  } else {
                    debug.log('mhid not found')
                  }
                }
              })
            }
          }
        })
      })
  }

  const onCrop = (data: any, info: Record<string, any>) => {
    setShowImageCrop(false)
    setImage(data, info, function (err) {
      if (err) {
        notification.error({
          message: t('Failed to Save Photo'),
          description:
            t(
              'An error occurred while processing this photo. Please confirm that the photo has valid GPS location information. Error Message: '
            ) + err,
          duration: 0
        })
      } else {
        message.info(t('Photo Added'))
      }
    })
  }

  let dataReview = <></>
  let dataForm = <></>
  let addPhotoButton = <></>

  const { geoJSON, image } = addPhotoPointState

  if (geoJSON) {
    // if we have a point show the preview map and data fields
    dataReview = (
      <>
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <Col sm={24} md={12}>
            <img
              style={{
                width: '100%',
                height: 'auto'
              }}
              src={image}
              alt='uploaded photo'
            />
          </Col>
          <Col sm={24} md={12}>
            <div
              style={{
                width: '400px',
                height: '400px'
              }}
            >
              <MapHubsMap
                id='add-photo-point-map'
                showFeatureInfoEditButtons={false}
                showLogo
                mapConfig={mapConfig}
                data={geoJSON}
                locale={locale}
                primaryColor={process.env.NEXT_PUBLIC_PRIMARY_COLOR}
              />
            </div>
          </Col>
        </Row>
        <Row>
          <Button
            type='primary'
            style={{
              marginLeft: '10px'
            }}
            onClick={resetPhoto}
          >
            {t('Replace Photo')}
          </Button>
        </Row>
      </>
    )
    dataForm = (
      <DataCollectionForm presets={layer.presets} onSubmit={submit} t={t} />
    )
  } else {
    addPhotoButton = (
      <Row>
        <p>{t('Upload a Photo with Location Information')}</p>
        <Button
          type='primary'
          style={{
            marginLeft: '10px'
          }}
          onClick={() => {
            setShowImageCrop(true)
          }}
        >
          {t('Add Photo')}
        </Button>
      </Row>
    )
  }

  return (
    <ErrorBoundary t={t}>
      <Layout title={`${t('Add Photo Point')} - ${t(layer.name)}`} hideFooter>
        <div
          style={{
            height: 'calc(100% - 50px)',
            marginTop: 0
          }}
        >
          <div className='container'>
            <Row
              style={{
                marginBottom: '20px',
                textAlign: 'center'
              }}
            >
              <h5>{t('Add data to:') + ' ' + t(layer.name)}</h5>
              {addPhotoButton}
            </Row>
            {dataReview}
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              {dataForm}
            </Row>
          </div>
          <ImageCrop
            visible={showImageCrop}
            onCancel={() => {
              setShowImageCrop(false)
            }}
            aspectRatio={1}
            lockAspect
            resize_max_width={1000}
            resize_max_height={1000}
            onCrop={onCrop}
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default AddPhotoPoint
