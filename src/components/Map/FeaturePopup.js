// @flow
import React from 'react'
import MapHubsComponent from '../../components/MapHubsComponent'
import request from 'superagent'
import slugify from 'slugify'
import GetNameField from '../../services/get-name-field'
import Attributes from './Attributes'
import _isequal from 'lodash.isequal'
import type {Feature} from 'geojson-flow'
import ActionPanel from './FeaturePopup/ActionPanel'
import type {Layer} from '../../stores/layer-store'

const checkClientError = require('../../services/client-error-response').checkClientError
const urlUtil = require('../../services/url-util')
const debug = require('../../services/debug')('map/featurepopup')

type Props = {
  features: Array<Feature>,
  showButtons: boolean
}

type State = {
  showAttributes: boolean,
  layerLoaded: boolean,
  layer?: Layer
}

export default class FeaturePopup extends MapHubsComponent<Props, State> {
  props: Props

  constructor (props: Props) {
    super(props)
    this.state = {
      layerLoaded: false,
      showAttributes: false
    }
  }

  componentDidMount () {
    if (this.props.features) {
      const selectedFeature = this.props.features[0]
      if (selectedFeature.properties.layer_id) {
        this.getLayer(selectedFeature.properties.layer_id, selectedFeature.properties.maphubs_host)
      } else {
        this.setState({layerLoaded: true})
      }
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!_isequal(this.props.features, nextProps.features)) {
      const selectedFeature = nextProps.features[0]
      if (selectedFeature.properties.layer_id) {
        this.getLayer(selectedFeature.properties.layer_id, selectedFeature.properties.maphubs_host)
      } else {
        this.setState({layerLoaded: true})
      }
    }
  }

  getLayer = (layerId: number, host: string) => {
    debug.info(`Getting layer info for: ${layerId} from ${host}`)
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

  renderContentWithoutImage = () => {

  }

  renderContentWithImage = (name: string, description: string, photoUrl: string, featureName: string, properties: Object) => {
    // const {layer} = this.state
    // const selectedFeature = this.props.features[0]
    // let imageHeight = 'calc(100% - 100px)'

    let nameDisplay

    if (name) {
      nameDisplay = (
        <span className='card-title'
          style={{
            fontSize: '16px',
            lineHeight: '16px',
            margin: 0,
            padding: '5px'
          }}>
          {name}
        </span>
      )
    }

    let descDisplay
    if (description) {
      descDisplay = (
        <div className='card-content' style={{padding: '5px', overflowY: 'auto'}}>
          <p>{description}</p>
        </div>
      )
    } else {
      descDisplay = (
        <div className='card-content' style={{padding: 0, height: 'calc(100% - 150px)'}}>
          <Attributes attributes={properties} />
        </div>
      )
    }

    return (
      <div style={{height: '100%'}}>
        <div className='card-image' style={{
          height: '150px',
          background: `url(${photoUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}>
          {nameDisplay}
        </div>
        {descDisplay}
      </div>
    )
  }

  renderFeature = (feature: Object, i: number) => {
    const {layer, showAttributes} = this.state
    let nameField
    let nameFieldValue
    let featureName = ''
    let descriptionField
    let descriptionFieldValue

    let photoUrl = null
    if (feature.properties.photo_url) {
      photoUrl = feature.properties.photo_url
    } else if (feature.properties['Photo URL']) {
      photoUrl = feature.properties['Photo URL']
    }

    if (this.state.layer) {
      nameField = GetNameField.getNameField(feature.properties, this.state.layer.presets)
      if (nameField) {
        nameFieldValue = feature.properties[nameField]
        if (nameFieldValue) {
          featureName = slugify(nameFieldValue)
        }
      }

      descriptionField = GetNameField.getDescriptionField(feature.properties, this.state.layer.presets)
      if (descriptionField) {
        descriptionFieldValue = feature.properties[descriptionField]
      }
    }

    if (!feature || !feature.properties) {
      return (
        <p key={`popup-feature-${i}`}>{this.__('Error Invalid Feature')}</p>
      )
    }
    let content
    if (!showAttributes && photoUrl) {
      content = this.renderContentWithImage(nameFieldValue, descriptionFieldValue, photoUrl, featureName, feature.properties)
    } else {
      content = <Attributes attributes={feature.properties} />
    }

    return (
      <div className='card' style={{width: '200px', height: '250px', margin: 0}}>
        <div className='card-content no-padding' style={{height: 'calc(100% - 41px)'}}>
          {content}
        </div>
        <div className='card-action' style={{padding: '10px 10px'}}>
          <ActionPanel layer={layer} t={this.__} tObject={this._o_}
            selectedFeature={feature} featureName={featureName}
            toggled={showAttributes}
            enableToggle={photoUrl} toggleData={this.toggleAttributes}
          />
        </div>
      </div>
    )
  }

  toggleAttributes = () => {
    this.setState({showAttributes: !this.state.showAttributes})
  }

  render () {
    const {features} = this.props

    return (
      <div >
        {
          features.map((feature, i) => this.renderFeature(feature, i))
        }
      </div>
    )
  }
}
