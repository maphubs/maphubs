// @flow
import React from 'react'
import request from 'superagent'
import slugify from 'slugify'
import GetNameField from './Styles/get-name-field'
import Attributes from './Attributes'
import _isequal from 'lodash.isequal'
import type {Feature} from 'geojson-flow'
import ActionPanel from './FeaturePopup/ActionPanel'
import type {Layer} from '../../types/layer'

const checkClientError = require('../../services/client-error-response').checkClientError
const urlUtil = require('../../services/url-util')
const debug = require('../../services/debug')('map/featurepopup')

type Props = {
  features: Array<Feature>,
  showButtons: boolean,
  t: Function
}

type State = {
  showAttributes: boolean,
  layerLoaded: boolean,
  layer?: Layer
}

export default class FeaturePopup extends React.Component<Props, State> {
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

  componentDidUpdate () {
    if (this.image) {
      M.Materialbox.init(this.image, {})
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

  renderContentWithImage = (name?: string, description?: string, photoUrl: string, featureName: string, properties: Object) => {
    const {layerLoaded} = this.state
    const {t} = this.props
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
    if (layerLoaded) {
      if (description) {
        descDisplay = (
          <div className='card-content' style={{padding: '3px', height: 'calc(100% - 100px)', overflowY: 'auto'}}>
            <p>{description}</p>
          </div>
        )
      } else {
        descDisplay = (
          <div className='card-content' style={{padding: 0, height: 'calc(100% - 100px)'}}>
            <Attributes attributes={properties} t={t} />
          </div>
        )
      }
    } else {
      descDisplay = (
        <div className='card-content' style={{padding: 0, width: '100%', height: 'calc(100% - 100px)', margin: 'auto', textAlign: 'center'}}>
          <div className='preloader-wrapper small active'>
            <div className='spinner-layer omh-accent-text'>
              <div className='circle-clipper left'>
                <div className='circle' />
              </div><div className='gap-patch'>
                <div className='circle' />
              </div><div className='circle-clipper right'>
                <div className='circle' />
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={{height: '100%'}}>
        <div ref={(el) => { this.image = el }}
          className='card-image materialboxed' style={{
            height: '100px',
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
    const {t} = this.props
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
        <p key={`popup-feature-${i}`}>{t('Error Invalid Feature')}</p>
      )
    }
    let content
    if (!showAttributes && photoUrl) {
      content = this.renderContentWithImage(nameFieldValue, descriptionFieldValue, photoUrl, featureName, feature.properties)
    } else {
      content = <Attributes attributes={feature.properties} t={t} />
    }

    return (
      <div key='feature' className='card' style={{width: '150px', height: '200px', margin: 0, boxShadow: 'none'}}>
        <div className='card-content no-padding' style={{height: 'calc(100% - 35px)'}}>
          {content}
        </div>
        <div className='card-action' style={{padding: '5px 5px'}}>
          <ActionPanel layer={layer} t={t}
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
