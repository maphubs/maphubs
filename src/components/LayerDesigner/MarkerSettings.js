// @flow
import React from 'react'
import Formsy from 'formsy-react'
import { Row } from 'antd'
import Toggle from '../forms/toggle'
import Select from '../forms/select'
import _assignIn from 'lodash.assignin'
import MapStyles from '../Map/Styles'
import _isequal from 'lodash.isequal'

type Props = {|
  onChange: Function,
  layer: Object,
  style: Object,
  color: string,
  t: Function
|}

type State = {
  options: Object
}

export default class MarkerSettings extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)

    const options = {
      shape: 'MAP_PIN',
      size: '32',
      width: 32,
      height: 32,
      shapeFill: 'red',
      shapeFillOpacity: 1,
      shapeStroke: '#323333',
      shapeStrokeWidth: 1,
      icon: 'none',
      iconFill: 'white',
      iconFillOpacity: 1,
      iconStroke: '#323333',
      iconStrokeWidth: 0,
      inverted: false
    }

    // get state from style
    if (props.style.layers && Array.isArray(props.style.layers) && props.style.layers.length > 0) {
      props.style.layers.forEach((layer) => {
        if (layer.id.startsWith('omh-data-point') &&
          layer.metadata && layer.metadata['maphubs:markers']
        ) {
          _assignIn(options, layer.metadata['maphubs:markers'])
          if (layer.metadata['maphubs:markers'].invert) {
            options.strokeFill = props.color
            options.iconFill = props.color
          } else {
            options.shapeFill = props.color
          }
        }
      })
    }

    this.state = {
      style: props.style,
      options
    }
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

  onFormChange = (model: Object) => {
    if (model.size) {
      model.width = parseInt(model.size)
      model.height = parseInt(model.size)
    }

    const options = JSON.parse(JSON.stringify(this.state.options))
    _assignIn(options, model)

    // invert colors
    if (model.inverted) {
      options.shapeStroke = this.props.color
      options.iconFill = this.props.color
      options.shapeFill = 'white'
      options.shapeFillOpacity = 0.75
      options.shapeStrokeWidth = 2
    } else {
      options.shapeFill = this.props.color
      options.iconFill = 'white'
      options.shapeStroke = '#323333'
      options.shapeFillOpacity = 1
      options.shapeStrokeWidth = 1
    }

    let style
    if (options.enabled) {
      style = MapStyles.markers.enableMarkers(this.props.style, options, this.props.layer)
    } else {
      style = MapStyles.markers.disableMarkers(this.props.style)
    }
    this.setState({options})
    this.props.onChange(style, options)
  }

  render () {
    const {t} = this.props
    const shapeOptions = [
      {value: 'MAP_PIN', label: t('Map Pin')},
      {value: 'SQUARE_PIN', label: t('Square Pin')},
      {value: 'SQUARE_ROUNDED', label: t('Rounded Square')},
      {value: 'SQUARE', label: t('Square')},
      {value: 'CIRCLE', label: t('Circle')}
    ]
    const sizeOptions = [
      {value: '16', label: '16'},
      {value: '24', label: '24'},
      {value: '32', label: '32'},
      {value: '40', label: '40'},
      {value: '48', label: '48'},
      {value: '56', label: '56'},
      {value: '64', label: '64'},
      {value: '96', label: '96'}
    ]
    const iconOptions = [
      {value: 'none', label: t('None')},
      {value: 'maphubs-icon-boat', label: t('Boat')},
      {value: 'maphubs-icon-campfire', label: t('Campfire')},
      {value: 'maphubs-icon-cargo-ship', label: t('Cargo Ship')},
      {value: 'maphubs-icon-chainsaw', label: t('Chainsaw')},
      {value: 'maphubs-icon-chipmunk', label: t('Chipmunk')},
      {value: 'maphubs-icon-clearcutting', label: t('Clearcutting')},
      {value: 'maphubs-icon-clipboard', label: t('Clipboard')},
      {value: 'maphubs-icon-clinic', label: t('Clinic')},
      {value: 'maphubs-icon-dam', label: t('Dam')},
      {value: 'maphubs-icon-dolphin', label: t('Dolphin')},
      {value: 'maphubs-icon-elephant', label: t('Elephant')},
      {value: 'maphubs-icon-eye', label: t('Eye')},
      {value: 'maphubs-icon-factory', label: t('Factory')},
      {value: 'maphubs-icon-farmer', label: t('Farmer')},
      {value: 'maphubs-icon-farmer-family', label: t('Farmer Family')},
      {value: 'maphubs-icon-farmer-wife', label: t('Farmer Wife')},
      {value: 'maphubs-icon-fox', label: t('Fox')},
      {value: 'maphubs-icon-gorilla', label: t('Gorilla')},
      {value: 'maphubs-icon-hand-one', label: t('Hand')},
      {value: 'maphubs-icon-hummingbird', label: t('HummingBird')},
      {value: 'maphubs-icon-log-pile', label: t('Log Pile')},
      {value: 'maphubs-icon-magnifier', label: t('Magnifier')},
      {value: 'maphubs-icon-mining', label: t('Mining')},
      {value: 'maphubs-icon-money', label: t('Money')},
      {value: 'maphubs-icon-oil', label: t('Oil')},
      {value: 'maphubs-icon-palm-oil', label: t('Palm Oil')},
      {value: 'maphubs-icon-play', label: t('Play')},
      {value: 'maphubs-icon-sawblade', label: t('Sawblade')},
      {value: 'maphubs-icon-star', label: t('Star')},
      {value: 'maphubs-icon-tractor', label: t('Tractor')},
      {value: 'maphubs-icon-truck', label: t('Truck')},
      {value: 'maphubs-icon-tug-boat', label: t('Tug Boat')},
      {value: 'maphubs-icon-turtle', label: t('Turtle')},
      {value: 'maphubs-icon-turtle2', label: t('Turtle 2')},
      {value: 'maphubs-icon-video', label: t('Video')},
      {value: 'maphubs-icon-village', label: t('Village')},
      {value: 'maphubs-icon-whale', label: t('Whale')},
      {value: 'maphubs-icon-wifi', label: t('WiFi')},
      {value: 'maphubs-icon-wolf', label: t('Wolf')}
    ]

    return (
      <Row style={{marginBottom: '20px'}}>
        <Formsy ref='form' onChange={this.onFormChange}>
          <Row style={{marginTop: '10px', marginBottom: '0px', padding: '0 .75rem'}}>
            <b>{t('Enable Markers')}</b>
            <Toggle
              name='enabled' labelOff={t('Off')} labelOn={t('On')}
              checked={this.state.options.enabled}
            />
          </Row>
          <Row>
            <Select
              name='shape' id='markers-shape-select' label={t('Marker Shape')} options={shapeOptions}
              value={this.state.options.shape} startEmpty={!this.state.options.shape}
              dataPosition='right' dataTooltip={t('Shape of the map marker')}
              required
            />
          </Row>
          <Row>
            <Select
              name='size' id='markers-size-select' label={t('Marker Size')} options={sizeOptions}
              value={this.state.options.size} startEmpty={!this.state.options.size}
              dataPosition='right' dataTooltip={t('Size of the map marker')}
              required
            />
          </Row>
          <Row>
            <Select
              name='icon' id='markers-icon-select' label={t('Marker Icon')} options={iconOptions}
              value={this.state.options.icon} startEmpty={!this.state.options.icon}
              dataPosition='right' dataTooltip={t('Marker icon overlay')}
              required
            />
          </Row>
          <Row style={{padding: '0 .75rem'}}>
            <b>{t('Invert Colors')}</b>
            <Toggle
              name='inverted' labelOff={t('Off')} labelOn={t('On')}
              checked={this.state.options.inverted}
            />
          </Row>
        </Formsy>
      </Row>
    )
  }
}
