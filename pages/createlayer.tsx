import React from 'react'
import slugify from 'slugify'
import { Steps, Row } from 'antd'
import Header from '../src/components/header'
import Step1 from '../src/components/CreateLayer/Step1'
import Step2 from '../src/components/CreateLayer/Step2'
import Step3 from '../src/components/CreateLayer/Step3'
import debugFactory from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'

import Reflux from '../src/components/Rehydrate'
import LayerStore from '../src/stores/layer-store'
import { Provider } from 'unstated'
import BaseMapContainer from '../src/components/Map/containers/BaseMapContainer'
import MapContainer from '../src/components/Map/containers/MapContainer'
import type { Group } from '../src/stores/GroupStore'
import type { Layer } from '../src/types/layer'
import type { LayerStoreState } from '../src/stores/layer-store'

import ErrorBoundary from '../src/components/ErrorBoundary'
import $ from 'jquery'
import getConfig from 'next/config'
import { LocalizedString } from '../src/types/LocalizedString'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const debug = debugFactory('CreateLayer')
const Step = Steps.Step
type Props = {
  groups: Array<Group>
  layer: Layer
  locale: string
  _csrf: string
  headerConfig: Record<string, any>
  mapConfig: Record<string, any>
  user: Record<string, any>
}
type State = {
  step: number
} & LayerStoreState
export default class CreateLayer extends React.Component<Props, State> {
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

  static defaultProps:
    | any
    | {
        groups: Array<any>
      } = {
    groups: []
  }
  state: State = {
    step: 1
  }
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [LayerStore]

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
    this.MapState = new MapContainer()

    Reflux.rehydrate(LayerStore, props.layer)
  }

  componentDidMount() {
    const _this = this

    window.addEventListener('onunload', (e) => {
      if (
        _this.state.layer_id &&
        _this.state.layer_id !== -1 &&
        !_this.state.complete
      ) {
        $.ajax({
          type: 'POST',
          url: '/api/layer/admin/delete',
          contentType: 'application/json;charset=UTF-8',
          dataType: 'json',
          data: JSON.stringify({
            layer_id: _this.state.layer_id,
            _csrf: _this.state._csrf
          }),
          async: false,

          success() {},

          error(msg) {
            debug.log(msg)
          }
        })
      }
    })

    this.unloadHandler = (e) => {
      if (!_this.state.complete) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', this.unloadHandler)
  }

  unloadHandler: any

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  submit: any | ((layerId: number, name: LocalizedString) => void) = (
    layerId: number,
    name: LocalizedString
  ) => {
    window.location.assign(
      '/layer/info/' + layerId + '/' + slugify(this.t(name))
    )
  }
  nextStep: any | (() => void) = () => {
    this.setState({
      step: this.state.step + 1
    })
  }
  prevStep: any | (() => void) = () => {
    this.setState({
      step: this.state.step - 1
    })
  }

  render(): JSX.Element {
    const { t, props, state, prevStep, nextStep, submit } = this
    const { headerConfig, groups, mapConfig } = props
    const { step } = state

    if (!groups || groups.length === 0) {
      return (
        <div>
          <Header {...headerConfig} />
          <main>
            <div className='container'>
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                <h5>{t('Please Join a Group')}</h5>
                <p>
                  {t('Please create or join a group before creating a layer.')}
                </p>
              </Row>
            </div>
          </main>
        </div>
      )
    }

    return (
      <ErrorBoundary t={t}>
        <Provider inject={[this.BaseMapState, this.MapState]}>
          <Header {...headerConfig} />
          <main
            style={{
              height: '100%'
            }}
          >
            <div
              style={{
                marginLeft: '10px',
                marginRight: '10px',
                marginTop: '10px',
                height: '100%'
              }}
            >
              <Row
                style={{
                  padding: '20px'
                }}
              >
                <Steps size='small' current={step - 1}>
                  <Step title={t('Data')} />
                  <Step title={t('Metadata')} />
                  <Step title={t('Style')} />
                  <Step title={t('Complete')} />
                </Steps>
              </Row>
              <Row
                style={{
                  height: 'calc(100% - 65px)'
                }}
              >
                {step === 1 && (
                  <Step1 onSubmit={nextStep} mapConfig={mapConfig} />
                )}
                {step === 2 && (
                  <Step2
                    groups={groups}
                    showPrev
                    onPrev={prevStep}
                    onSubmit={nextStep}
                    t={t}
                  />
                )}
                {step === 3 && (
                  <Step3 onSubmit={submit} mapConfig={mapConfig} />
                )}
              </Row>
            </div>
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
