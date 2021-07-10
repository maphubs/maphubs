import React from 'react'
import Header from '../src/components/header'
import Reflux from '../src/components/Rehydrate'
import Map from '../src/components/Map'
import DataCollectionForm from '../src/components/DataCollection/DataCollectionForm'
import ImageCrop from '../src/components/ImageCrop'
import AddPhotoPointStore from '../src/stores/AddPhotoPointStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../src/components/Map/containers/BaseMapContainer'
import Actions from '../src/actions/AddPhotoPointActions'
import GetNameField from '../src/components/Map/Styles/get-name-field'
import ErrorBoundary from '../src/components/ErrorBoundary'
import type { LocaleStoreState } from '../src/stores/LocaleStore'
import type { AddPhotoPointStoreState } from '../src/stores/AddPhotoPointStore'
import { Modal, message, notification, Row, Col, Button } from 'antd'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { confirm } = Modal

const debug = DebugService('addphotopoint')

type Props = {
  layer: Record<string, any>
  locale: string
  _csrf: string
  mapConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
type State = LocaleStoreState & AddPhotoPointStoreState
export default class AddPhotoPoint extends React.Component<Props, State> {
  BaseMapState: BaseMapContainer
  static async getInitialProps({
    req,
    query
  }: {
    req: any
    query: Record<string, any>
  }): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  state: State = {
    saving: false,
    layer: {}
  }

  stores: any

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

  unloadHandler: any

  componentDidMount(): void {
    const { state, unloadHandler } = this

    this.unloadHandler = (e) => {
      if (!state.submitted) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', unloadHandler)
  }

  componentWillUnmount(): void {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  showImageCrop: any | (() => void) = () => {
    this.refs.imagecrop.show()
  }
  resetPhoto: any | (() => void) = () => {
    Actions.resetPhoto()
    this.showImageCrop()
  }
  onCrop: any | ((data: any, info: any) => void) = (
    data: any,
    info: Record<string, any>
  ) => {
    const { t } = this
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
  onSubmit: any | ((model: any) => void) = (model: Record<string, any>) => {
    const { t, state } = this
    const { _csrf, layer, geoJSON, mhid } = state

    const closeMessage = message.loading(t('Saving'), 0)
    Actions.submit(model, _csrf, (err) => {
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

  render(): JSX.Element {
    const {
      t,
      props,
      state,
      resetPhoto,
      onSubmit,
      showImageCrop,
      onCrop,
      BaseMapState
    } = this
    const { layer, mapConfig, headerConfig } = props
    const { geoJSON, image } = state
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
                <Map
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
            onClick={showImageCrop}
          >
            {t('Add Photo')}
          </Button>
        </Row>
      )
    }

    return (
      <ErrorBoundary t={t}>
        <Provider inject={[BaseMapState]}>
          <Header {...headerConfig} />
          <main
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
              ref='imagecrop'
              aspectRatio={1}
              lockAspect
              resize_max_width={1000}
              resize_max_height={1000}
              onCrop={onCrop}
            />
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
