// @flow
import React from 'react'
import Formsy from 'formsy-react'
import Toggle from '../forms/toggle'
import MapStyles from '../Map/Styles'
import MapHubsComponent from '../MapHubsComponent'
import _isequal from 'lodash.isequal'
import type {GLStyle} from '../../types/mapbox-gl-style'
import type {Layer} from '../../stores/layer-store'

type Props = {|
  onChange: Function,
  layer: Layer,
  style: GLStyle,
  legend: string
|}

type State = {
  interactive: boolean,
  showBehindBaseMapLabels: boolean,
  fill: boolean
}

export default class AdvancedLayerSettings extends MapHubsComponent<Props, State> {
  props: Props

  state: State

  constructor (props: Props) {
    super(props)
    const state = this.getStateFromStyleProp(props)
    this.state = state
  }

  getStateFromStyleProp (props: Props): State {
    const defaults = MapStyles.settings.defaultLayerSettings()
    if (props.layer.layer_id && props.layer.data_type && props.style) {
      const glLayerId = props.style.layers[0].id

      let interactive = defaults.interactive
      const interactiveSetting: any = MapStyles.settings.getLayerSetting(props.style, glLayerId, 'interactive')
      if (typeof interactiveSetting !== 'undefined') {
        interactive = interactiveSetting
      }

      let showBehindBaseMapLabels = defaults.showBehindBaseMapLabels
      const showBehindBaseMapLabelsSetting = MapStyles.settings.getLayerSetting(props.style, glLayerId, 'showBehindBaseMapLabels')
      if (typeof showBehindBaseMapLabelsSetting !== 'undefined') {
        showBehindBaseMapLabels = showBehindBaseMapLabelsSetting
      }

      let fill = defaults.fill
      const fillSetting = MapStyles.settings.getLayerSetting(props.style, glLayerId, 'fill')
      if (typeof fillSetting !== 'undefined') {
        fill = fillSetting
      }

      return {
        style: props.style,
        interactive,
        showBehindBaseMapLabels,
        fill
      }
    } else {
      return this.state
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    const state = this.getStateFromStyleProp(nextProps)
    this.setState(state)
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

  onFormChange = (values: Object) => {
    let legend = this.props.legend

    let style = this.props.style
    if (values.interactive !== this.state.interactive) {
      const glLayerId = style.layers[0].id
      style = MapStyles.settings.setLayerSetting(style, glLayerId, 'interactive', values.interactive)
      this.setState({interactive: values.interactive})
    } else if (values.showBehindBaseMapLabels !== this.state.showBehindBaseMapLabels) {
      style = MapStyles.settings.setLayerSettingAll(style, 'showBehindBaseMapLabels', values.showBehindBaseMapLabels, 'symbol')
      this.setState({showBehindBaseMapLabels: values.showBehindBaseMapLabels})
    } else if (values.fill !== this.state.fill &&
      this.props.layer.data_type === 'polygon') {
      style = MapStyles.settings.setLayerSettingAll(style, 'fill', values.fill, 'symbol')
      const result = MapStyles.polygon.toggleFill(style, values.fill)
      style = result.style
      this.setState({fill: values.fill})
      if (values.fill) {
        legend = MapStyles.legend.legendWithColor(this.props.layer, result.legendColor)
      } else {
        legend = MapStyles.legend.outlineLegendWithColor(this.props.layer, result.legendColor)
      }
    } else {
      // nochange
      return
    }
    this.props.onChange(style, legend)
  }

  render () {
    let toggleFill
    if (this.props.layer.data_type === 'polygon') {
      toggleFill = (
        <div className='row'>
          <b>{this.__('Fill')}</b>
          <Toggle
            name='fill'
            labelOff={this.__('Outline Only')}
            labelOn={this.__('Fill')}
            checked={this.state.interactive}
            dataPosition='right'
            dataTooltip={this.__('Hide polygon fill and only show the outline in the selected color')}
          />
        </div>
      )
    }

    return (
      <div className='row' style={{marginLeft: '10px'}}>
        <Formsy ref='form' onChange={this.onFormChange}>
          {toggleFill}
          <div className='row'>
            <b>{this.__('Interactive')}</b>
            <Toggle name='interactive' labelOff={this.__('Off')} labelOn={this.__('On')}
              checked={this.state.interactive}
              dataPosition='right' dataTooltip={this.__('Allow users to interact with this layer by clicking the map')}
            />
          </div>
          <div className='row'>
            <b>{this.__('Show Below Base Map Labels')}</b>
            <Toggle name='showBehindBaseMapLabels' labelOff={this.__('Off')} labelOn={this.__('On')}
              checked={this.state.showBehindBaseMapLabels}
              dataPosition='right' dataTooltip={this.__('Allow base map labels to display on top of this layer')}
            />
          </div>
        </Formsy>
      </div>
    )
  }
}
