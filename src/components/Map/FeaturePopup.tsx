import React from 'react'
import request from 'superagent'
import slugify from 'slugify'
import { Card, Spin } from 'antd'
import GetNameField from './Styles/get-name-field'
import Attributes from './Attributes'
import _isequal from 'lodash.isequal'
import ActionPanel from './FeaturePopup/ActionPanel'
import type { Layer } from '../../types/layer'
import 'react-image-lightbox/style.css'

const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')(
  'map/featurepopup'
)

let Lightbox
type Props = {
  features: Array<any>
  showButtons: boolean
  t: (...args: Array<any>) => any
}
type State = {
  showAttributes: boolean
  layerLoaded: boolean
  layer?: Layer
  lightboxOpen?: boolean
}
export default class FeaturePopup extends React.Component<Props, State> {
  static defaultProps: {
    showButtons: boolean
  } = {
    showButtons: true
  }
  image: any

  constructor(props: Props) {
    super(props)
    this.state = {
      layerLoaded: false,
      showAttributes: false
    }
  }

  componentDidMount(): void {
    Lightbox = require('react-image-lightbox').default

    if (this.props.features) {
      const selectedFeature = this.props.features[0]
      const properties = selectedFeature.properties

      if (properties.layer_id) {
        this.getLayer(properties.layer_id, properties.maphubs_host)
      } else {
        this.setState({
          layerLoaded: true
        })
      }
    }
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (!_isequal(this.props.features, nextProps.features)) {
      const selectedFeature = nextProps.features[0]
      const properties = selectedFeature.properties

      if (properties.layer_id) {
        this.getLayer(properties.layer_id, properties.maphubs_host)
      } else {
        this.setState({
          layerLoaded: true
        })
      }
    }
  }

  getLayer: (layerId: number, host: string) => void = (
    layerId: number,
    host: string
  ) => {
    const { setState } = this

    debug.info(`Getting layer info for: ${layerId} from ${host}`)

    const baseUrl =
      host && host !== 'dev.docker' && host !== window.location.hostname
        ? 'https://' + host
        : urlUtil.getBaseUrl()

    if (window.location.href.startsWith(`${baseUrl}/map/share/`)) {
      console.log(`layer lookup not supported on ${window.location.href}`)
      this.setState({
        layerLoaded: true
      })
      return
    }

    request
      .get(baseUrl + '/api/layer/info/' + layerId)
      .type('json')
      .accept('json')
      .end((err, res) => {
        console.log('getLayer()')
        console.log(err)
        console.log(res)

        if (!err && res.body?.layer) {
          const layer = res.body.layer

          setState({
            layer,
            layerLoaded: true
          })
        } else {
          setState({
            layerLoaded: true
          })

          debug.error(`failed to load layer info for: ${layerId}`)
        }
      })
  }
  renderContentWithoutImage = (): JSX.Element => {
    return <></>
  }
  renderContentWithImage = (
    name: string,
    description: string,
    photoUrl: string,
    featureName: string,
    properties: Record<string, any>
  ): JSX.Element => {
    const { layerLoaded, lightboxOpen } = this.state
    const { t } = this.props
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
          }}
        >
          {name}
        </span>
      )
    }

    let descDisplay

    if (layerLoaded) {
      descDisplay = description ? (
        <div
          style={{
            padding: '3px',
            height: 'calc(100% - 100px)',
            overflowY: 'auto'
          }}
        >
          <p>{description}</p>
        </div>
      ) : (
        <div
          style={{
            padding: 0,
            height: 'calc(100% - 100px)'
          }}
        >
          <Attributes attributes={properties} t={t} />
        </div>
      )
    } else {
      descDisplay = (
        <div
          style={{
            padding: 0,
            width: '100%',
            height: 'calc(100% - 100px)',
            margin: 'auto',
            textAlign: 'center'
          }}
        >
          <Spin />
        </div>
      )
    }

    return (
      <div
        style={{
          height: '100%'
        }}
      >
        {lightboxOpen && (
          <Lightbox
            mainSrc={photoUrl}
            imageTitle={name}
            imageCaption={description}
            onCloseRequest={() =>
              this.setState({
                lightboxOpen: false
              })
            }
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
          onClick={() =>
            this.setState({
              lightboxOpen: true
            })
          }
        >
          {nameDisplay}
        </div>
        {descDisplay}
      </div>
    )
  }
  renderFeature = (feature: Record<string, any>, i: number): JSX.Element => {
    const { layer, showAttributes } = this.state
    const { t, showButtons } = this.props
    let nameField
    let nameFieldValue
    let featureName = ''
    let descriptionField
    let descriptionFieldValue

    if (!feature || !feature.properties) {
      return <p key={`popup-feature-${i}`}>{t('Error Invalid Feature')}</p>
    }

    let photoUrl

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

      descriptionField = GetNameField.getDescriptionField(
        feature.properties,
        layer.presets
      )

      if (descriptionField) {
        descriptionFieldValue = feature.properties[descriptionField]
      }
    }

    const content =
      !showAttributes && photoUrl ? (
        this.renderContentWithImage(
          nameFieldValue,
          descriptionFieldValue,
          photoUrl,
          featureName,
          feature.properties
        )
      ) : (
        <Attributes attributes={feature.properties} t={t} />
      )

    return (
      <Card
        key='feature'
        bodyStyle={{
          height: '100%',
          padding: '0'
        }}
        style={{
          width: '150px',
          height: '200px',
          margin: 0,
          boxShadow: 'none'
        }}
      >
        <div
          style={{
            height: showButtons ? 'calc(100% - 35px)' : '100%'
          }}
        >
          {content}
        </div>
        {showButtons && (
          <div
            style={{
              padding: '5px 5px'
            }}
          >
            <ActionPanel
              layer={layer}
              t={t}
              selectedFeature={feature}
              featureName={featureName}
              toggled={showAttributes}
              enableToggle={photoUrl}
              toggleData={this.toggleAttributes}
            />
          </div>
        )}
      </Card>
    )
  }
  toggleAttributes: () => void = () => {
    this.setState({
      showAttributes: !this.state.showAttributes
    })
  }

  render(): JSX.Element {
    const { features } = this.props
    return (
      <div>{features.map((feature, i) => this.renderFeature(feature, i))}</div>
    )
  }
}
