// @flow
import React from 'react'
import {withFormsy} from 'formsy-react'
import MapHubsComponent from '../MapHubsComponent'
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
  showRequired: Function,
  isValid: Function,
  showError: Function,
  setValue: Function,
  getValue: Function,
  getErrorMessage: Function
|}

type State = {
  charCount: number,
  value: string,
  isValid?: boolean,
  showError?: boolean,
  errorMessage?: string
}

class TextInput extends MapHubsComponent<Props, State> {
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
        this.props.setValue(nextProps.value)
      }

      this.setState({
        value: nextProps.getValue(),
        isValid: nextProps.isValid(),
        showError: nextProps.showError(),
        errorMessage: nextProps.getErrorMessage()
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
    const value = nextProps.getValue()
    const isValid = nextProps.isValid()
    const showError = nextProps.showError()
    const errorMessage = nextProps.getErrorMessage()
    if (value !== this.state.value ||
      isValid !== this.state.isValid ||
      showError !== this.state.showError ||
      errorMessage !== this.state.errorMessage
    ) {
      return true
    }
    return false
  }

  changeValue = (event) => {
    event.stopPropagation()
    this.props.setValue(event.currentTarget.value)

    this.setState({
      charCount: event.currentTarget.value.length
    })
  }

  render () {
    const value = this.props.getValue()
    const errorMessage = this.props.getErrorMessage()

    let className
    let inputClassName = ''
    if (this.props.useMaterialize) {
      className = classNames('input-field', this.props.className)
      inputClassName = classNames(
        {
          required: this.props.showRequired(),
          valid: this.props.isValid(),
          invalid: this.props.showError()
        }
      )
    } else {
      className = classNames(this.props.className)
    }

    let icon = ''
    if (this.props.icon) {
      icon = (<i className='material-icons prefix'>{this.props.icon}</i>)
    }
    let countColor = 'black'
    if (this.state.charCount > this.props.length) countColor = 'red'

    let labelClassName = ''
    if (value && value !== '') {
      labelClassName = 'active'
    }

    let id = ''
    if (this.props.id) {
      id = this.props.id
    } else {
      id = this.props.name
    }
    let charCount = ''
    if (this.props.showCharCount) {
      charCount = (
        <span
          className='character-counter'
          style={{float: 'right', fontSize: '12px', height: '1px', color: countColor}}
        >
          {this.state.charCount} / {this.props.length}
        </span>
      )
    }

    return (
      <Tooltip
        title={this.props.dataTooltip}
        placement={this.props.dataPosition}
      >
        <div ref='inputWrapper' className={className} style={this.props.style}>
          {icon}
          <input
            ref='input' id={id} type={this.props.type} className={inputClassName} placeholder={this.props.placeholder} value={value}
            disabled={this.props.disabled}
            onClick={this.props.onClick}
            onChange={this.changeValue}
          />
          <label htmlFor={id} className={labelClassName} data-error={errorMessage} data-success={this.props.successText}>{this.props.label}</label>
          {charCount}
        </div>
      </Tooltip>
    )
  }
}
export default withFormsy(TextInput)
