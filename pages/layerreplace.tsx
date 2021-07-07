import React from 'react'
import { Row, Button } from 'antd'
import Header from '../src/components/header'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../src/components/Map/containers/BaseMapContainer'
import LayerActions from '../src/actions/LayerActions'
import LayerStore from '../src/stores/layer-store'
import slugify from 'slugify'
import UploadLayerReplacement from '../src/components/CreateLayer/UploadLayerReplacement'
import type { LocaleStoreState } from '../src/stores/LocaleStore'
import type { AddPhotoPointStoreState } from '../src/stores/AddPhotoPointStore'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  layer: Record<string, any>
  locale: string
  _csrf: string
  mapConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
type State = {
  downloaded: boolean
  submitted: boolean
} & LocaleStoreState &
  AddPhotoPointStoreState
export default class LayerReplace extends React.Component<Props, State> {
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
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [LayerStore]
    this.state = {
      downloaded: false,
      submitted: false,
      layer: props.layer
    }
    Reflux.rehydrate(LocaleStore, {
      locale: props.locale,
      _csrf: props._csrf
    })

    if (props.user) {
      Reflux.rehydrate(UserStore, {
        user: props.user
      })
    }

    Reflux.rehydrate(LayerStore, props.layer)
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
    LayerActions.loadLayer()
  }

  unloadHandler: any

  componentDidMount(): void {
    const _this = this

    this.unloadHandler = (e) => {
      if (!_this.state.submitted) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', this.unloadHandler)
  }

  componentWillUnmount(): void {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  onDownload = (): void => {
    this.setState({
      downloaded: true
    })
  }
  onDataSubmit = (): void => {
    this.setState({
      submitted: true
    })
    window.location.assign(
      '/layer/info/' +
        this.props.layer.layer_id +
        '/' +
        slugify(this.t(this.props.layer.name))
    )
  }

  render(): JSX.Element {
    const { t, props, state, onDownload, onDataSubmit, BaseMapState } = this
    const { layer, headerConfig, mapConfig } = props
    const { downloaded } = state
    const maphubsFileURL = `/api/layer/${
      layer.layer_id
    }/export/maphubs/${slugify(t(layer.name))}.maphubs`
    return (
      <ErrorBoundary>
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
                <h5>{t('Replace data in layer:') + ' ' + t(layer.name)}</h5>
                <p>
                  {t(
                    'First you must download the backup file. This file can be used to restore the previous data if needed.'
                  )}
                </p>
                <Button
                  type='primary'
                  href={maphubsFileURL}
                  target='_blank'
                  rel='noopener noreferrer'
                  onClick={onDownload}
                >
                  {t('Download Backup File')}
                </Button>
              </Row>
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                {downloaded && (
                  <UploadLayerReplacement
                    onSubmit={onDataSubmit}
                    mapConfig={mapConfig}
                  />
                )}
              </Row>
            </div>
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
