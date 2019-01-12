// @flow
import React from 'react'
import Formsy, {addValidationRule} from 'formsy-react'
import slugify from 'slugify'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import MapContainer from '../components/Map/containers/MapContainer'
import Header from '../components/header'
import TextInput from '../components/forms/textInput'
import SelectGroup from '../components/Groups/SelectGroup'
import Map from '../components/Map'
import MiniLegend from '../components/Map/MiniLegend'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

import type {Layer} from '../types/layer'

import request from 'superagent'
import $ from 'jquery'
import {checkClientError} from '../services/client-error-response'

type Props = {|
  groups: Array<Object>,
  locale: string,
  mapConfig: Object,
  headerConfig: Object,
  _csrf: string,
  user: Object
|}

type State = {
  canSubmit: boolean,
  layer?: Layer,
  remote_host?: string,
  group_id?: string,
  complete: boolean
}

export default class CreateRemoteLayer extends MapHubsComponent<Props, State> {
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
    canSubmit: false,
    complete: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }

    let baseMapContainerInit = {}
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit = {baseMapOptions: props.mapConfig.baseMapOptions}
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()
  }

  componentWillMount () {
    super.componentWillMount()

    addValidationRule('isHttps', (values, value) => {
      if (value) {
        return value.startsWith('https://')
      } else {
        return false
      }
    })

    addValidationRule('validMapHubsLayerPath', (values, value) => {
      if (typeof window !== 'undefined' && value) {
        const pathParts = $('<a>').prop('href', value).prop('pathname').split('/')
        if (pathParts[1] === 'layer' &&
        (pathParts[2] === 'info' || pathParts[2] === 'map') &&
        pathParts[3]) {
          return true
        }
      }
      return false
    })
  }

  componentDidMount () {
    const {t} = this
    const _this = this
    window.addEventListener('beforeunload', (e) => {
      if (_this.state.layer && !_this.state.complete) {
        const msg = t('You have not finished creating your layer.')
        e.returnValue = msg
        return msg
      }
    })
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    })
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    })
  }

  loadRemoteUrl = (model: Object) => {
    const _this = this
    const remoteLayerUrl = model.remoteLayerUrl
    const group_id = model.group

    const link = $('<a>').prop('href', remoteLayerUrl)

    const remote_host = link.prop('hostname')
    const pathParts = link.prop('pathname').split('/')
    if (pathParts[1] === 'layer' &&
    (pathParts[2] === 'info' || pathParts[2] === 'map') &&
    pathParts[3]) {
      const remote_layer_id = pathParts[3]

      request.get('https://' + remote_host + '/api/layer/metadata/' + remote_layer_id)
        .type('json').accept('json').timeout(1200000)
        .end((err, res) => {
          checkClientError(res, err, () => {}, (cb) => {
            _this.setState({remote_host, group_id, layer: res.body.layer})
            cb()
          })
        })
    }
  }

  saveLayer = () => {
    const _this = this
    const {layer, group_id, remote_host} = this.state
    if (layer) {
      const name = layer.name || {}
      request.post('/api/layer/create/remote')
        .type('json').accept('json')
        .send({
          group_id,
          layer,
          host: remote_host
        })
        .end((err, res) => {
          checkClientError(res, err, () => {}, (cb) => {
            const layer_id = res.body.layer_id
            _this.setState({complete: true})
            window.location = '/layer/info/' + layer_id + '/' + slugify(_this.t(name))
            cb()
          })
        })
    }
  }

  render () {
    const {t} = this
    if (!this.props.groups || this.props.groups.length === 0) {
      return (
        <ErrorBoundary>
          <Header {...this.props.headerConfig} />
          <main>
            <div className='container'>
              <div className='row'>
                <h5>{t('Please Join a Group')}</h5>
                <p>{t('Please create or join a group before creating a layer.')}</p>
              </div>
            </div>
          </main>
        </ErrorBoundary>
      )
    }

    let layerReview = ''

    if (this.state.layer) {
      layerReview = (
        <div className='row'>
          <div className='col s12'>
            <div>
              <Map style={{width: '100%', height: '400px'}}
                id='remote-layer-preview-map'
                showFeatureInfoEditButtons={false}
                mapConfig={this.props.mapConfig}
                glStyle={this.state.layer.style}
                fitBounds={this.state.layer.preview_position.bbox}
                primaryColor={MAPHUBS_CONFIG.primaryColor}
                logoSmall={MAPHUBS_CONFIG.logoSmall}
                logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
                t={t}
              >
                <MiniLegend
                  t={this.t}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    minWidth: '275px',
                    width: '25%',
                    maxWidth: '325px',
                    maxHeight: 'calc(100% - 200px)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  collapsible hideInactive={false} showLayersButton={false}
                  title={this.state.layer.name}
                  layers={[this.state.layer]} />
              </Map>
            </div>
          </div>
          <div>
            <button className='btn right' style={{marginTop: '20px'}}
              onClick={this.saveLayer}>{t('Save Layer')}</button>
          </div>
        </div>
      )
    }
    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState, this.MapState]}>
          <Header {...this.props.headerConfig} />
          <main>
            <h4>{t('Link to a Remote Layer')}</h4>
            <div className='container center'>
              <p>{t('Please copy and paste a link to a remote MapHubs layer')}</p>
              <div className='row'>
                <Formsy onValidSubmit={this.loadRemoteUrl} onValid={this.enableButton} onInvalid={this.disableButton}>
                  <TextInput
                    name='remoteLayerUrl' label={t('Remote MapHubs URL')} icon='link' className='col s12' validations='maxLength:250,isHttps,validMapHubsLayerPath' validationErrors={{
                      maxLength: t('Must be 250 characters or less.'),
                      isHttps: t('MapHubs requires encryption for external links, URLs must start with https://'),
                      validMapHubsLayerPath: t('Not a valid MapHubs Layer URL')
                    }} length={250}
                    dataPosition='top' dataTooltip={t('MapHubs Layer URL ex: https://maphubs.com/layer/info/123/my-layer')}
                    required />
                  <SelectGroup groups={this.props.groups} type='layer' />
                  <div className='right'>
                    <button type='submit' className='waves-effect waves-light btn' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{t('Load Remote Layer')}</button>
                  </div>
                </Formsy>
              </div>
              {layerReview}

            </div>

          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
