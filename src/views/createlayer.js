// @flow
import React from 'react'
import slugify from 'slugify'
import Header from '../components/header'
import Step1 from '../components/CreateLayer/Step1'
import Step2 from '../components/CreateLayer/Step2'
import Step5 from '../components/CreateLayer/Step5'
import debugFactory from '../services/debug'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import LayerStore from '../stores/layer-store'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import MapContainer from '../components/Map/containers/MapContainer'
import type {Group} from '../stores/GroupStore'
import type {Layer} from '../types/layer'
import type {LayerStoreState} from '../stores/layer-store'
import type {LocaleStoreState} from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

import $ from 'jquery'
const classNames = require('classnames')
const debug = debugFactory('CreateLayer')

type Props = {
  groups: Array<Group>,
  layer: Layer,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object,
  user: Object
}

type State = {
  step: number
} & LayerStoreState & LocaleStoreState

export default class CreateLayer extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    groups: []
  }

  state: State = {
    step: 1
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)

    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})

    let baseMapContainerInit = {}
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit = {baseMapOptions: props.mapConfig.baseMapOptions}
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()

    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }

    Reflux.rehydrate(LayerStore, this.props.layer)
  }

  componentDidMount () {
    const _this = this
    window.addEventListener('onunload', (e) => {
      if (_this.state.layer_id && _this.state.layer_id !== -1 && !_this.state.complete) {
        $.ajax({
          type: 'POST',
          url: '/api/layer/admin/delete',
          contentType: 'application/json;charset=UTF-8',
          dataType: 'json',
          data: JSON.stringify({layer_id: _this.state.layer_id, _csrf: _this.state._csrf}),
          async: false,
          success () {

          },
          error (msg) {
            debug.log(msg)
          }
        })
      }
    })

    window.addEventListener('beforeunload', (e) => {
      if (!_this.state.complete) {
        const msg = _this.__('You have not finished creating your layer, if you leave now your layer will be deleted.')
        e.returnValue = msg
        return msg
      }
    })
  }

  submit = (layerId: number, name: LocalizedString) => {
    window.location = '/layer/info/' + layerId + '/' + slugify(this._o_(name))
  }

  nextStep = () => {
    this.setState({step: this.state.step + 1})
  }

  prevStep = () => {
    this.setState({step: this.state.step - 1})
  }

  render () {
    if (!this.props.groups || this.props.groups.length === 0) {
      return (
        <div>
          <Header {...this.props.headerConfig} />
          <main>
            <div className='container'>
              <div className='row'>
                <h5>{this.__('Please Join a Group')}</h5>
                <p>{this.__('Please create or join a group before creating a layer.')}</p>
              </div>
            </div>
          </main>
        </div>
      )
    }

    const stepText = this.__('Step') + ' ' + this.state.step
    let progressWidth = ''

    const progressClassName = classNames('determinate', progressWidth)
    let step1 = ''
    if (this.state.step === 1) {
      progressWidth = 'width-25'
      step1 = (
        <Step1 onSubmit={this.nextStep} mapConfig={this.props.mapConfig} />
      )
    }
    let step2 = ''
    if (this.state.step === 2) {
      progressWidth = 'width-50'
      step2 = (
        <Step2 groups={this.props.groups} showPrev onPrev={this.prevStep} onSubmit={this.nextStep} />
      )
    }
    let step3 = ''
    if (this.state.step === 3) {
      progressWidth = 'width-75'
      step3 = (
        <Step5 onPrev={this.prevStep} onSubmit={this.submit} mapConfig={this.props.mapConfig} />
      )
    }

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState, this.MapState]}>
          <Header {...this.props.headerConfig} />
          <main>
            <div style={{marginLeft: '10px', marginRight: '10px', marginTop: '10px'}}>
              <div className='row center no-margin'>

                <b>{stepText}</b>

                <div className='progress'>
                  <div className={progressClassName} />
                </div>
              </div>
              {step1}
              {step2}
              {step3}
            </div>
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
