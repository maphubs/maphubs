// @flow
import React from 'react'
import Attributes from './Attributes'
import request from 'superagent'
import GroupTag from '../../components/Groups/GroupTag'
import MapHubsComponent from '../../components/MapHubsComponent'
import _isequal from 'lodash.isequal'
import type {Layer} from '../../stores/layer-store'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import slugify from 'slugify'
import GetNameField from '../../services/get-name-field'

const $ = require('jquery')
const checkClientError = require('../../services/client-error-response').checkClientError
const urlUtil = require('../../services/url-util')
const debug = require('../../services/debug')('map/featurebox')

type Props = {|
  feature: Object,
  selected: boolean,
  onUnselected: Function,
  showButtons: boolean
|}

type State = {
  maxHeight: string,
  layerLoaded: boolean,
  layer?: Layer
} & LocaleStoreState

export default class FeatureBox extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    showButtons: true,
    selected: false
  }

  state: State

  constructor (props: Props) {
    super(props)
    this.state = {
      maxHeight: 'calc(100% - 50px)',
      layerLoaded: false
    }
  }

  componentDidMount () {
    if (this.props.feature) {
      const selectedFeature = this.props.feature
      if (selectedFeature.properties.layer_id) {
        this.getLayer(selectedFeature.properties.layer_id, selectedFeature.properties.maphubs_host)
      } else {
        this.setState({layerLoaded: true})
      }
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!_isequal(this.props.feature, nextProps.feature)) {
      const selectedFeature = nextProps.feature
      if (selectedFeature.properties.layer_id) {
        this.getLayer(selectedFeature.properties.layer_id, selectedFeature.properties.maphubs_host)
      } else {
        this.setState({layerLoaded: true})
      }
    }
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    if (!prevState.layerLoaded && this.state.layerLoaded) {
      $('.feature-box-tooltips').tooltip()
    }
  }

  getLayer = (layerId: number, host: string) => {
    const _this = this
    let baseUrl
    if (host && host !== 'dev.docker' && host !== window.location.hostname) {
      baseUrl = 'https://' + host
    } else {
      baseUrl = urlUtil.getBaseUrl()
    }
    request.get(baseUrl + '/api/layer/info/' + layerId)
      .type('json').accept('json')
      .end((err, res) => {
        checkClientError(res, err, () => {}, (cb) => {
          if (res.body && res.body.layer) {
            const layer = res.body.layer
            _this.setState({layer, layerLoaded: true})
          } else {
            debug.error(`failed to load layer info for: ${layerId}`)
          }
          cb()
        })
      })
  }

  handleCloseSelected = () => {
    this.props.onUnselected()
  }

  render () {
    let closeButton = ''
    let header = ''
    let infoPanel = ''

    const baseUrl = urlUtil.getBaseUrl()

    if (this.props.feature) {
      closeButton = (
        <a style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}}>
          <i className='material-icons selected-feature-close' onClick={this.handleCloseSelected}>close</i>
        </a>
      )

      header = (<h6 style={{position: 'absolute', top: 0, left: '5px', fontSize: '12px'}}>{this.__('Selected Feature')}</h6>)

      if (this.props.showButtons) {
        let mhid = -1
        let source_layer_id = ''
        let host = ''
        let featureName = 'unknown'
        if (this.props.feature) {
          var currentFeature = this.props.feature
          if (currentFeature && currentFeature.properties) {
            mhid = currentFeature.properties.mhid
            source_layer_id = currentFeature.properties.layer_id
            host = currentFeature.properties.maphubs_host
          }
        }

        let layerinfo = ''
        if (this.state.layer) {
          const group_id = this.state.layer.owned_by_group_id
          const local_layer_id = this.state.layer.layer_id ? this.state.layer.layer_id : 0
          const layerName = this.state.layer.name
          let layerLink
          if (host === window.location.hostname || host === 'dev.docker') {
            layerLink = `${baseUrl}/lyr/${local_layer_id}`
          } else {
            layerLink = `https://${host}/lyr/${local_layer_id}`
          }
          layerinfo = (
            <div style={{textAlign: 'left'}}>
              <b><a className='truncate' target='_blank' rel='noopener noreferrer' href={layerLink}>{this._o_(layerName)}</a></b>
              <GroupTag className={'left'} group={group_id} size={15} fontSize={8} />
            </div>
          )
          if (this.props.feature && this.state.layer) {
            const nameField = GetNameField.getNameField(this.props.feature.properties, this.state.layer.presets)
            if (nameField) {
              const nameFieldValue = this.props.feature.properties[nameField]
              if (nameFieldValue) {
                featureName = slugify(nameFieldValue)
              }
            }
          }
        }

        let featureLink, featureID
        if (typeof mhid === 'string' && mhid.includes(':')) {
          featureID = mhid.split(':')[1]
        } else {
          featureID = mhid
        }

        if (host === window.location.hostname || host === 'dev.docker') {
          featureLink = `/feature/${source_layer_id}/${featureID}/${featureName}`
        } else {
          featureLink = `https://${host}/feature/${source_layer_id}/${featureID}/${featureName}`
        }
        let featureButton = ''
        if (host && featureLink) {
          featureButton = (
            <a href={featureLink} target='_blank' rel='noopener noreferrer'
              className='feature-box-tooltips' data-delay='50' data-position='bottom' data-tooltip={this.__('More Info')}>
              <i className='material-icons omh-accent-color' style={{fontSize: 32}}>info_outline</i>
            </a>
          )
        }
        infoPanel = (<div className='row' style={{marginTop: '10px', marginBottom: '10px'}}>
          <div className='col s10 center'>
            {layerinfo}
          </div>
          <div className='col s2 center no-padding'>
            {featureButton}
          </div>
        </div>)
      }
    }

    // only show the panel if there is at least one feature active
    let display = 'none'
    let attributes = ''
    let properties: Object = {}
    if (this.props.feature) {
      display = 'flex'
      currentFeature = this.props.feature
      if (currentFeature && currentFeature.properties) {
        properties = currentFeature.properties
      }

      attributes = (
        <Attributes attributes={properties}>
          <div style={{position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', borderTop: '1px solid #DDD'}}>
            {infoPanel}
          </div>
        </Attributes>
      )
    }

    return (
      <div className='features card' style={{display, maxHeight: this.state.maxHeight}}>
        <div className='features-container'>
          {closeButton}
          {header}
          <div style={{width: '100%', display: 'flex'}}>
            {attributes}
          </div>
        </div>
      </div>
    )
  }
}
