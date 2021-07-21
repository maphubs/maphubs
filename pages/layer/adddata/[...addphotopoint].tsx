import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../src/components/Layout'
import DataCollectionForm from '../../../src/components/DataCollection/DataCollectionForm'
import ImageCrop from '../../../src/components/ImageCrop'
import Actions from '../../../src/actions/AddPhotoPointActions'
import GetNameField from '../../../src/components/Map/Styles/get-name-field'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import { Modal, message, notification, Row, Col, Button } from 'antd'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import getConfig from 'next/config'
import useT from '../../../src/hooks/useT'
import useUnload from '../../../src/hooks/useUnload'
import useSWR from 'swr'
import useStickyResult from '../../../src/hooks/useStickyResult'
import { Layer } from '../../../src/types/layer'
import dynamic from 'next/dynamic'
const MapHubsMap = dynamic(() => import('../../../src/components/Map'), {
  ssr: false
})

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { confirm } = Modal

const debug = DebugService('addphotopoint')

const AddPhotoPoint = (): JSX.Element => {
  const router = useRouter()
  const { t } = useT()
  const [showImageCrop, setShowImageCrop] = useState(false)

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

  const { submitted } = layerState

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
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
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
    Actions.resetPhoto()
    setShowImageCrop(true)
  }

  const onCrop = (data: any, info: Record<string, any>) => {
    setShowImageCrop(false)
    Actions.setImage(data, info, function (err) {
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
  const onSubmit = (model: Record<string, any>) => {
    const closeMessage = message.loading(t('Saving'), 0)
    Actions.submit(model, (err) => {
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
              window.location.assign(featurePageUrl)
            } else {
              debug.log('mhid not found')
            }
          }
        })
      }
    })
  }

  let dataReview = <></>
  let dataForm = <></>
  let addPhotoButton = <></>

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
                width: '400px'
              }}
            >
              <MapHubsMap
                id='add-photo-point-map'
                style={{
                  width: '100%',
                  height: '400px'
                }}
                showFeatureInfoEditButtons={false}
                showLogo
                mapConfig={mapConfig}
                data={geoJSON}
                t={t}
                primaryColor={MAPHUBS_CONFIG.primaryColor}
                logoSmall={MAPHUBS_CONFIG.logoSmall}
                logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
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
      <DataCollectionForm presets={layer.presets} onSubmit={onSubmit} />
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
