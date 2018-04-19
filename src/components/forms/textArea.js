// @flow
import React from 'react'
import {withFormsy} from 'formsy-react'
import MapHubsComponent from '../MapHubsComponent'
import _isequal from 'lodash.isequal'
import {Tooltip} from 'react-tippy'
import classNames from 'classnames'

type Props = {
  length: number,
  value: string,
  icon: string,
  className: string,
  dataTooltip: string,
  dataDelay: number,
  dataPosition: string,
  name: string,
  label: string,
  // Added by Formsy
  showRequired: Function,
  isValid: Function,
  showError: Function,
  setValue: Function,
  getErrorMessage: Function
}

type State = {
   value: string,
   charCount: number
}

class TextArea extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    length: 0,
    value: '',
    dataDelay: 100
  }

  constructor (props) {
    super(props)
    this.state = {
      value: this.props.value,
      charCount: this.props.value ? this.props.value.length : 0
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.value !== nextProps.value) {
      let charCount = 0
      if (nextProps.value) charCount = nextProps.value.length
      this.setState({
        value: nextProps.value,
        charCount
      })
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

  changeValue = (event) => {
    event.stopPropagation()
    this.props.setValue(event.currentTarget.value)
    this.setState({
      value: event.currentTarget.value,
      charCount: event.currentTarget.value.length
    })
  }

  render () {
    const className = classNames('input-field', this.props.className)
    const textAreaClassName = classNames(
      'materialize-textarea',
      {
        required: this.props.showRequired(),
        valid: this.props.isValid(),
        invalid: this.props.showError()
      }
    )

    let icon = ''
    if (this.props.icon) {
      icon = (<i className='material-icons prefix'>{this.props.icon}</i>)
    }
    let countColor = 'black'
    if (this.state.charCount > this.props.length) countColor = 'red'

    let labelClassName = ''
    if (this.state.value && this.state.value !== '') {
      labelClassName = 'active'
    }

    return (
      <Tooltip
        disabled={!this.props.dataTooltip}
        title={this.props.dataTooltip}
        position={this.props.dataPosition}
        inertia
        followCursor
      >
        <div ref='inputWrapper' className={className}>
          {icon}
          <textarea ref='textarea' id={this.props.name} className={textAreaClassName} value={this.state.value} onChange={this.changeValue} />
          <label htmlFor={this.props.name} className={labelClassName} data-error={this.props.getErrorMessage()} data-success=''>{this.props.label}</label>
          <span className='character-counter'
            style={{float: 'right', fontSize: '12px', height: '1px', color: countColor}}>
            {this.state.charCount} / {this.props.length}
          </span>
        </div>
      </Tooltip>
    )
  }
}
export default withFormsy(TextArea)
