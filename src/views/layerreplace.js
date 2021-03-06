// @flow
import type {Node} from "React";import React from 'react'
import { Row, Button } from 'antd'
import Header from '../components/header'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import LayerActions from '../actions/LayerActions'
import LayerStore from '../stores/layer-store'
import slugify from 'slugify'
import UploadLayerReplacement from '../components/CreateLayer/UploadLayerReplacement'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {AddPhotoPointStoreState} from '../stores/AddPhotoPointStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

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
  submitted: boolean
} & LocaleStoreState & AddPhotoPointStoreState

export default class LayerReplace extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
    this.state = {
      downloaded: false,
      submitted: false,
      layer: props.layer
    }
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    Reflux.rehydrate(LayerStore, props.layer)
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
    LayerActions.loadLayer()
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

  onDownload: any | (() => void) = () => {
    this.setState({downloaded: true})
  }

  onDataSubmit: any | (() => void) = () => {
    this.setState({submitted: true})
    window.location = '/layer/info/' + this.props.layer.layer_id + '/' + slugify(this.t(this.props.layer.name))
  }

  render (): Node {
    const {t} = this
    const { layer } = this.props
    const { downloaded } = this.state
    const maphubsFileURL = `/api/layer/${layer.layer_id}/export/maphubs/${slugify(t(layer.name))}.maphubs`

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState]}>
          <Header {...this.props.headerConfig} />
          <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
            <div className='container'>
              <Row style={{marginBottom: '20px', textAlign: 'center'}}>
                <h5>{t('Replace data in layer:') + ' ' + t(layer.name)}</h5>
                <p>{t('First you must download the backup file. This file can be used to restore the previous data if needed.')}</p>
                <Button type='primary' href={maphubsFileURL} target='_blank' rel='noopener noreferrer' onClick={this.onDownload}>{t('Download Backup File')}</Button>
              </Row>
              <Row style={{marginBottom: '20px'}}>
                {downloaded &&
                  <UploadLayerReplacement showPrev={false} onSubmit={this.onDataSubmit} mapConfig={this.props.mapConfig} />}
              </Row>
            </div>
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
