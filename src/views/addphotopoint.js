// @flow
import React from 'react'
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
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import ConfirmationActions from '../actions/ConfirmationActions'
import Progress from '../components/Progress'
import GetNameField from '../components/Map/Styles/get-name-field'
import ErrorBoundary from '../components/ErrorBoundary'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {AddPhotoPointStoreState} from '../stores/AddPhotoPointStore'

const debug = require('../services/debug')('addphotopoint')

type Props = {
  layer: Object,
  locale: string,
  _csrf: string,
  mapConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {
  saving: boolean
} & LocaleStoreState & AddPhotoPointStoreState

export default class AddPhotoPoint extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
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

    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    Reflux.rehydrate(AddPhotoPointStore, {layer: this.props.layer})
    let baseMapContainerInit = {}
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit = {baseMapOptions: props.mapConfig.baseMapOptions}
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  componentDidMount () {
    const _this = this
    window.addEventListener('beforeunload', (e) => {
      if (!_this.state.submitted) {
        const msg = _this.__('You have not saved your data, your work will be lost.')
        e.returnValue = msg
        return msg
      }
    })
  }

  showImageCrop = () => {
    this.refs.imagecrop.show()
  }

  resetPhoto = () => {
    Actions.resetPhoto()
    this.showImageCrop()
  }

  onCrop = (data: any, info: Object) => {
    const _this = this
    Actions.setImage(data, info, function (err) {
      if (err) {
        MessageActions.showMessage({
          title: _this.__('Failed to Save Photo'),
          message: this.__('An error occurred while processing this photo. Please confirm that the photo has valid GPS location information. Error Message: ') + err
        })
      } else {
        NotificationActions.showNotification({message: _this.__('Photo Added')})
      }
    })
  }

  onSubmit = (model: Object) => {
    const _this = this
    this.setState({saving: true})
    Actions.submit(model, this.state._csrf, (err) => {
      _this.setState({saving: false})
      if (err) {
        MessageActions.showMessage({title: _this.__('Server Error'), message: err})
      } else {
        ConfirmationActions.showConfirmation({
          title: _this.__('Photo Saved'),
          message: _this.__('Do you want to add another photo?'),
          postitiveButtonText: _this.__('Yes'),
          negativeButtonText: _this.__('No'),
          onPositiveResponse () {
            location.reload()
          },
          onNegativeResponse () {
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

  render () {
    let dataReview = ''
    let dataForm = ''
    let addPhotoButton = ''
    if (this.state.geoJSON) {
      // if we have a point show the preview map and data fields
      dataReview = (

        <div className='row'>
          <div className='col m6 s12'>
            <img style={{width: '100%', height: 'auto'}} src={this.state.image} alt='uploaded photo' />
          </div>
          <div className='col m6 s12'>
            <div style={{width: '400px'}}>
              <Map
                id='add-photo-point-map'
                style={{width: '100%', height: '400px'}}
                showFeatureInfoEditButtons={false}
                showLogo={false}
                mapConfig={this.props.mapConfig}
                data={this.state.geoJSON}
                t={this.t}
              />
            </div>
          </div>
          <div className='row no-margin'>
            <button className='btn' style={{marginLeft: '10px'}}
              onClick={this.resetPhoto}>{this.__('Replace Photo')}</button>
          </div>
        </div>
      )

      dataForm = (
        <DataCollectionForm presets={this.props.layer.presets} onSubmit={this.onSubmit} />
      )
    } else {
      addPhotoButton = (
        <div className='row no-margin'>
          <p>{this.__('Upload a Photo with Location Information')}</p>
          <button className='btn' style={{marginLeft: '10px'}}
            onClick={this.showImageCrop}>{this.__('Add Photo')}</button>
        </div>
      )
    }

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState]}>
          <Header {...this.props.headerConfig} />
          <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
            <div className='container'>
              <div className='row center-align'>
                <h5>{this.__('Add data to:') + ' ' + this._o_(this.props.layer.name)}</h5>
                {addPhotoButton}
              </div>
              {dataReview}
              <div className='row'>
                {dataForm}
              </div>
            </div>
            <ImageCrop ref='imagecrop' aspectRatio={1} lockAspect resize_max_width={1000} resize_max_height={1000} onCrop={this.onCrop} />
            <Progress id='saving' title={this.__('Saving')} subTitle='' dismissible={false} show={this.state.saving} />
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
