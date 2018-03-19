// @flow
import React from 'react'
import Header from '../components/header'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import BaseMapStore from '../stores/map/BaseMapStore'
import LayerActions from '../actions/LayerActions'
import LayerStore from '../stores/layer-store'
import Progress from '../components/Progress'
import slugify from 'slugify'
import UploadLayerReplacement from '../components/CreateLayer/UploadLayerReplacement'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {AddPhotoPointStoreState} from '../stores/AddPhotoPointStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

type Props = {
  layer: Object,
  locale: string,
  _csrf: string,
  mapConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {
  downloaded: boolean,
  saving: boolean,
  submitted: boolean
} & LocaleStoreState & AddPhotoPointStoreState

export default class LayerReplace extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    downloaded: false,
    saving: false,
    submitted: false,
    layer: {}
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
    this.stores.push(BaseMapStore)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    Reflux.rehydrate(LayerStore, this.props.layer)
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions})
    }
    LayerActions.loadLayer()
  }

  componentDidMount () {
    const _this = this
    window.addEventListener('beforeunload', (e) => {
      if (!_this.state.submitted) {
        const msg = _this.__('You have not finished. Layer data replacement may be incomplete.')
        e.returnValue = msg
        return msg
      }
    })
  }

  onDownload = () => {
    this.setState({downloaded: true})
  }

  onDataSubmit = () => {
    this.setState({submitted: true})
    window.location = '/layer/info/' + this.props.layer.layer_id + '/' + slugify(this._o_(this.props.layer.name))
  }

  render () {
    const name = slugify(this._o_(this.props.layer.name))
    const layerId = this.props.layer.layer_id
    const maphubsFileURL = `/api/layer/${layerId}/export/maphubs/${name}.maphubs`

    let upload = ''
    if (this.state.downloaded) {
      upload = (
        <UploadLayerReplacement showPrev={false} onSubmit={this.onDataSubmit} mapConfig={this.props.mapConfig} />
      )
    }

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
          <div className='container'>
            <div className='row center-align'>
              <h5>{this.__('Replace data in layer:') + ' ' + this._o_(this.props.layer.name)}</h5>
              <p>{this.__('First you must download the backup file. This file can be used to restore the previous data if needed.')}</p>
              <a className='btn' href={maphubsFileURL} target='_blank' onClick={this.onDownload}>{this.__('Download Backup File')}</a>
            </div>
            <div className='row'>
              {upload}
            </div>
          </div>
          <Progress id='saving' title={this.__('Saving')} subTitle='' dismissible={false} show={this.state.saving} />
        </main>
      </ErrorBoundary>
    )
  }
}
