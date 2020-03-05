// @flow
import React from 'react'
import {withFormsy} from 'formsy-react'
import _isequal from 'lodash.isequal'
import {Tooltip} from 'antd'
import classNames from 'classnames'

type Props = {|
  value: string,
  length: number,
  successText: string,
  disabled: boolean,
  icon: string,
  className: string,
  dataTooltip: string,
  dataDelay: number,
  dataPosition: string,
  name: string,
  label: string,
  placeholder: string,
  id: string,
  type: string,
  style: Object,
  showCharCount: boolean,
  useMaterialize: boolean,
  onClick: Function,
  // Added by Formsy
  showRequired: boolean,
  isValid: boolean,
  showError: boolean,
  setValue: Function,
  value: string,
  errorMessage: string
|}

type State = {
  charCount: number
}

class TextInput extends React.Component<Props, State> {
  props: Props

  static defaultProps = {
    length: 100,
    successText: '',
    defaultValue: '',
    disabled: false,
    value: '',
    dataDelay: 100,
    type: 'text',
    style: {},
    showCharCount: true,
    useMaterialize: true
  }

  constructor (props: Props) {
    super(props)
    this.state = {
      value: props.value,
      charCount: props.value ? props.value.length : 0
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (this.props.value !== nextProps.value) {
      let charCount = 0
      if (nextProps.value) {
        charCount = nextProps.value.length
        this.setState({
          charCount
        })
        // this.props.setValue(nextProps.value)
      }
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
  }

  changeValue = (event) => {
    event.stopPropagation()
    this.props.setValue(event.currentTarget.value)

    this.setState({
      charCount: event.currentTarget.value.length
    })
  }

  render () {
    const { id, name, showRequired, isValid, showError, value, icon, showCharCount, errorMessage, length } = this.props
    const { charCount } = this.state

    let className
    let inputClassName = ''
    if (this.props.useMaterialize) {
      className = classNames('input-field', this.props.className)
      inputClassName = classNames(
        {
          required: showRequired,
          valid: isValid,
          invalid: showError
        }
      )
    } else {
      className = classNames(this.props.className)
    }

    return (
      <Tooltip
        title={this.props.dataTooltip}
        placement={this.props.dataPosition}
      >
        <div ref='inputWrapper' className={className} style={this.props.style}>
          {icon &&
            <i className='material-icons prefix'>{icon}</i>}
          <input
            ref='input' id={id || name} type={this.props.type} className={inputClassName} placeholder={this.props.placeholder} value={value}
            disabled={this.props.disabled}
            onClick={this.props.onClick}
            onChange={this.changeValue}
          />
          <label htmlFor={id || name} className={value ? 'active' : ''} data-error={errorMessage} data-success={this.props.successText}>{this.props.label}</label>
          {showCharCount &&
            <span
              className='character-counter'
              style={{float: 'right', fontSize: '12px', height: '1px', color: charCount > length ? 'red' : 'black'}}
            >
              {charCount} / {length}
            </span>}
        </div>
      </Tooltip>
    )
  }
}
export default withFormsy(TextInput)
