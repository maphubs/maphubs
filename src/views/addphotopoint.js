// @flow
import type {Node} from "React";import React from 'react'
import Header from '../components/header'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import UserStore from '../stores/UserStore'
import Map from '../components/Map'
import DataCollectionForm from '../components/DataCollection/DataCollectionForm'
import ImageCrop from '../components/ImageCrop'
import AddPhotoPointStore from '../stores/AddPhotoPointStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import Actions from '../actions/AddPhotoPointActions'
import GetNameField from '../components/Map/Styles/get-name-field'
import ErrorBoundary from '../components/ErrorBoundary'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {AddPhotoPointStoreState} from '../stores/AddPhotoPointStore'
import { Modal, message, notification, Row, Col, Button } from 'antd'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { confirm } = Modal

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('addphotopoint')

type Props = {
  layer: Object,
  locale: string,
  _csrf: string,
  mapConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {} & LocaleStoreState & AddPhotoPointStoreState

export default class AddPhotoPoint extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}): Promise<any> {
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

  constructor (props: Props) {
    super(props)
    this.stores.push(AddPhotoPointStore)

    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    Reflux.rehydrate(AddPhotoPointStore, {layer: props.layer})
    const baseMapContainerInit: {
      baseMap?: string,
      bingKey: string,
      tileHostingKey: string,
      mapboxAccessToken: string,
      baseMapOptions?: Object
    } = {
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  unloadHandler: any

  componentDidMount () {
    const _this = this
    this.unloadHandler = (e) => {
      if (!_this.state.submitted) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', this.unloadHandler)
  }

  componentWillUnmount () {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  showImageCrop: any | (() => void) = () => {
    this.refs.imagecrop.show()
  }

  resetPhoto: any | (() => void) = () => {
    Actions.resetPhoto()
    this.showImageCrop()
  }

  onCrop: any | ((data: any, info: any) => void) = (data: any, info: Object) => {
    const {t} = this
    Actions.setImage(data, info, function (err) {
      if (err) {
        notification.error({
          message: t('Failed to Save Photo'),
          description: t('An error occurred while processing this photo. Please confirm that the photo has valid GPS location information. Error Message: ') + err,
          duration: 0
        })
      } else {
        message.info(t('Photo Added'))
      }
    })
  }

  onSubmit: any | ((model: any) => void) = (model: Object) => {
    const {t} = this
    const _this = this
    const closeMessage = message.loading(t('Saving'), 0)
    Actions.submit(model, this.state._csrf, (err) => {
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
          onOk () {
            location.reload()
          },
          onCancel () {
            let featureName = 'unknown'
            const geoJSON: any = _this.state.geoJSON
            const layerId: string = (_this.state.layer && _this.state.layer.layer_id) ? _this.state.layer.layer_id.toString() : '0'
            if (geoJSON && geoJSON.features) {
              const features = geoJSON.features
              const props = features[0].properties
              const style = (_this.state.layer && _this.state.layer.style) ? _this.state.layer.style : undefined
              const presets = GetNameField.getPresetsFromStyle(style)
              const nameField = GetNameField.getNameField(props, presets)
              if (nameField) {
                featureName = props[nameField]
              }
            }
            if (_this.state.mhid) {
              const featureId = _this.state.mhid.split(':')[1]
              const featurePageUrl = `/feature/${layerId}/${featureId}/${featureName}`
              window.location = featurePageUrl
            } else {
              debug.log('mhid not found')
            }
          }
        })
      }
    })
  }

  render (): Node {
    const {t} = this
    let dataReview = ''
    let dataForm = ''
    let addPhotoButton = ''
    if (this.state.geoJSON) {
      // if we have a point show the preview map and data fields
      dataReview = (
        <>
          <Row style={{marginBottom: '20px'}}>
            <Col sm={24} md={12}>
              <img style={{width: '100%', height: 'auto'}} src={this.state.image} alt='uploaded photo' />
            </Col>
            <Col sm={24} md={12}>
              <div style={{width: '400px'}}>
                <Map
                  id='add-photo-point-map'
                  style={{width: '100%', height: '400px'}}
                  showFeatureInfoEditButtons={false}
                  showLogo
                  mapConfig={this.props.mapConfig}
                  data={this.state.geoJSON}
                  t={this.t}
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
              style={{marginLeft: '10px'}}
              onClick={this.resetPhoto}
            >{t('Replace Photo')}
            </Button>
          </Row>
        </>
      )

      dataForm = (
        <DataCollectionForm presets={this.props.layer.presets} onSubmit={this.onSubmit} />
      )
    } else {
      addPhotoButton = (
        <Row>
          <p>{t('Upload a Photo with Location Information')}</p>
          <Button
            type='primary' style={{marginLeft: '10px'}}
            onClick={this.showImageCrop}
          >{t('Add Photo')}
          </Button>
        </Row>
      )
    }

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState]}>
          <Header {...this.props.headerConfig} />
          <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
            <div className='container'>
              <Row style={{marginBottom: '20px', textAlign: 'center'}}>
                <h5>{t('Add data to:') + ' ' + this.t(this.props.layer.name)}</h5>
                {addPhotoButton}
              </Row>
              {dataReview}
              <Row style={{marginBottom: '20px'}}>
                {dataForm}
              </Row>
            </div>
            <ImageCrop ref='imagecrop' aspectRatio={1} lockAspect resize_max_width={1000} resize_max_height={1000} onCrop={this.onCrop} />
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
