import * as React from 'react'
import { withFormsy } from 'formsy-react'

import _isequal from 'lodash.isequal'
import { Tooltip, Input } from 'antd'
import { LocalizedString } from '../../types/LocalizedString'
type Props = {
  length: number
  value: string
  icon: React.ReactNode
  className: string
  tooltip: string
  dataDelay: number
  successText: string
  disabled: boolean
  tooltipPosition: string
  placeholder: string
  id: string
  name: string
  label: string
  // Added by Formsy
  showRequired: boolean
  isValid: boolean
  isRequired: boolean
  showError: boolean
  setValue: (...args: Array<any>) => any
  errorMessage: string
  showCharCount: boolean
  t: (v: string | LocalizedString) => string
}
type State = {
  value: string
  charCount: number
}

class TextArea extends React.Component<Props, State> {
  props: Props
  static defaultProps = {
    length: 0,
    value: '',
    dataDelay: 100,
    showCharCount: true
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      value: props.value,
      charCount: props.value ? props.value.length : 0
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      let charCount = 0
      if (nextProps.value) charCount = nextProps.value.length
      this.setState({
        value: nextProps.value,
        charCount
      })
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }

    if (!_isequal(this.state, nextState)) {
      return true
    }

    return false
  }

  changeValue = (value: string) => {
    this.setState({
      charCount: value?.length ?? 0
    })
    this.props.setValue(value)
  }

  render() {
    const {
      id,
      name,
      icon,
      showRequired,
      isRequired,
      isValid,
      showError,
      value,
      showCharCount,
      errorMessage,
      length,
      placeholder,
      disabled,
      successText,
      t,
      tooltip,
      tooltipPosition,
      label
    } = this.props
    const { charCount } = this.state
    return (
      <Tooltip title={tooltip} placement={tooltipPosition}>
        <label htmlFor={id || name}>
          {label} {isRequired && '*'}
        </label>
        <Input.TextArea
          autoSize={{
            minRows: 2,
            maxRows: 6
          }}
          type='text'
          prefix={icon}
          id={id || name}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            const val = e.target.value
            this.changeValue(val)
          }}
        />
        {showCharCount && (
          <span
            style={{
              float: 'right',
              fontSize: '12px',
              height: '1px',
              color: charCount > length ? 'red' : 'black'
            }}
          >
            {charCount} / {length}
          </span>
        )}
        {showRequired && (
          <p
            style={{
              color: 'red'
            }}
          >
            {t('Required')}
          </p>
        )}
        {showError && (
          <p
            style={{
              color: 'red'
            }}
          >
            {errorMessage}
          </p>
        )}
        {isValid && (
          <p
            style={{
              color: 'red'
            }}
          >
            {successText}
          </p>
        )}
      </Tooltip>
    )
  }
}

export default withFormsy(TextArea) as any
