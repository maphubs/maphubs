// @flow
import React from 'react'
import request from 'superagent'
import slugify from 'slugify'
import {Card, Spin} from 'antd'
import GetNameField from './Styles/get-name-field'
import Attributes from './Attributes'
import _isequal from 'lodash.isequal'
import type {Feature} from 'geojson-flow'
import ActionPanel from './FeaturePopup/ActionPanel'
import type {Layer} from '../../types/layer'
import 'react-image-lightbox/style.css'

const checkClientError = require('../../services/client-error-response').checkClientError
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('map/featurepopup')

let Lightbox

type Props = {
  features: Array<Feature>,
  showButtons: boolean,
  t: Function
}

type State = {
  showAttributes: boolean,
  layerLoaded: boolean,
  layer?: Layer,
  lightboxOpen?: boolean
}

export default class FeaturePopup extends React.Component<Props, State> {
  image: any

  constructor (props: Props) {
    super(props)
    this.state = {
      layerLoaded: false,
      showAttributes: false
    }
  }

  componentDidMount () {
    Lightbox = require('react-image-lightbox').default
    if (this.props.features) {
      const selectedFeature = this.props.features[0]
      const properties = selectedFeature.properties
      if (properties.layer_id) {
        this.getLayer(properties.layer_id, properties.maphubs_host)
      } else {
        this.setState({layerLoaded: true})
      }
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!_isequal(this.props.features, nextProps.features)) {
      const selectedFeature = nextProps.features[0]
      const properties = selectedFeature.properties
      if (properties.layer_id) {
        this.getLayer(properties.layer_id, properties.maphubs_host)
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

  renderContentWithImage = (name?: string, description?: string, photoUrl: string, featureName: string, properties: Object) => {
    const {layerLoaded, lightboxOpen} = this.state
    const {t} = this.props
    let nameDisplay

    if (name) {
      nameDisplay = (
        <span
          style={{
            fontSize: '14px',
            fontWeight: '800',
            color: 'white',
            lineHeight: '14px',
            margin: 0,
            position: 'absolute',
            left: '5px',
            bottom: '5px'
          }}>
          {name}
        </span>
      )
    }

    let descDisplay
    if (layerLoaded) {
      if (description) {
        descDisplay = (
          <div style={{padding: '3px', height: 'calc(100% - 100px)', overflowY: 'auto'}}>
            <p>{description}</p>
          </div>
        )
      } else {
        descDisplay = (
          <div style={{padding: 0, height: 'calc(100% - 100px)'}}>
            <Attributes attributes={properties} t={t} />
          </div>
        )
      }
    } else {
      descDisplay = (
        <div style={{padding: 0, width: '100%', height: 'calc(100% - 100px)', margin: 'auto', textAlign: 'center'}}>
          <Spin />
        </div>
      )
    }

    return (
      <div style={{height: '100%'}}>
        {lightboxOpen && (
          <Lightbox
            mainSrc={photoUrl}
            imageTitle={name}
            imageCaption={description}
            onCloseRequest={() => this.setState({ lightboxOpen: false })}
          />
        )}
        <div
          style={{
            height: '100px',
            background: `url(${photoUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            position: 'relative'
          }}
          onClick={() => this.setState({ lightboxOpen: true })}
        >
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

    if (layer) {
      nameField = GetNameField.getNameField(feature.properties, layer.presets)
      if (nameField) {
        nameFieldValue = feature.properties[nameField]
        if (nameFieldValue) {
          featureName = slugify(nameFieldValue)
        }
      }

      descriptionField = GetNameField.getDescriptionField(feature.properties, layer.presets)
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
      <Card
        key='feature'
        bodyStyle={{height: '100%', padding: '0'}}
        style={{width: '150px', height: '200px', margin: 0, boxShadow: 'none'}}>
        <div style={{height: 'calc(100% - 35px)'}}>
          {content}
        </div>
        <div style={{padding: '5px 5px'}}>
          <ActionPanel layer={layer} t={t}
            selectedFeature={feature} featureName={featureName}
            toggled={showAttributes}
            enableToggle={photoUrl} toggleData={this.toggleAttributes}
          />
        </div>
      </Card>
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
