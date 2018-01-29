// @flow
import React from 'react'
import {withFormsy} from 'formsy-react'
import MapHubsComponent from '../MapHubsComponent'
const classNames = require('classnames')
const $ = require('jquery')
const debug = require('../../services/debug')('Toggle')

type Props = {|
  className: string,
  dataTooltip: string,
  dataDelay: number,
  dataPosition: string,
  labelOn: string,
  labelOff: string,
  name: string,
  style: Object,
  disabled: boolean,
  onChange: Function,
  defaultChecked: boolean,
  checked: boolean,
  setValue: Function,
  getValue: Function
|}

class Toggle extends MapHubsComponent<Props, void> {
  props: Props

  static defaultProps = {
    style: {},
    defaultChecked: false,
    dataDelay: 100,
    disabled: false
  }

  componentWillMount () {
    super.componentWillMount()
    if ('checked' in this.props) {
      this.props.setValue(this.props.checked)
    } else {
      this.props.setValue(this.props.defaultChecked)
    }
  }

  componentDidMount () {
    if (this.props.dataTooltip) {
      $(this.refs.toggle).tooltip()
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    // only change if the props value is swapped
    const currentValue = this.props.checked
    if ('checked' in nextProps &&
    nextProps.checked !== currentValue) {
      this.props.setValue(nextProps.checked)
    }
  }

  componentDidUpdate (prevProps: Props) {
    if (!prevProps.dataTooltip && this.props.dataTooltip) {
      $(this.refs.toggle).tooltip()
    }
  }

  changeValue = (event) => {
    event.stopPropagation()
    const checked = event.currentTarget.checked
    debug.log('change value: ' + checked)
    if (checked !== this.props.getValue()) { this.props.setValue(checked) }
    if (this.props.onChange) { this.props.onChange(event.currentTarget.checked) }
  }

  render () {
    const props = {...this.props}
    // Remove React warning.
    // Warning: Input elements must be either controlled or uncontrolled
    // (specify either the value prop, or the defaultValue prop, but not both).
    delete props.defaultChecked

    const className = classNames('switch', this.props.className, {tooltipped: !!this.props.dataTooltip})

    let checked = this.props.getValue()

    if (typeof checked === 'boolean') {
      checked = checked ? 1 : 0
    }

    let leverClass = 'lever'
    if (!props.labelOn || props.labelOn === '') {
      leverClass = 'lever no-margin'
    }

    return (
      <div ref='toggle' className={className} disabled={props.disabled} data-delay={props.dataDelay} data-position={props.dataPosition}
        style={props.style}
        data-tooltip={props.dataTooltip}>
        <label>
          {props.labelOff}
          <input type='checkbox' id={props.name} checked={!!checked} disabled={props.disabled} onChange={this.changeValue} />
          <span className={leverClass} />
          {props.labelOn}
        </label>
      </div>
    )
  }
}
export default withFormsy(Toggle)
