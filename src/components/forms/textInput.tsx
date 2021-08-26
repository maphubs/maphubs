import * as React from 'react'
import { withFormsy } from 'formsy-react'
import _isequal from 'lodash.isequal'
import { Tooltip, Input } from 'antd'
import { LocalizedString } from '../../types/LocalizedString'
type Props = {
  value: string
  length: number
  successText: string
  disabled: boolean
  icon: React.ReactNode
  tooltip: string
  tooltipPosition: string
  name: string
  label: string
  placeholder: string
  id: string
  showCharCount: boolean
  // Added by Formsy
  showRequired: boolean
  isRequired: boolean
  isValid: boolean
  showError: boolean
  setValue: (...args: Array<any>) => any
  value: string
  errorMessage: string
  t: (v: string | LocalizedString) => string
}
type State = {
  charCount: number
}

class TextInput extends React.Component<Props, State> {
  static defaultProps = {
    length: 100,
    successText: '',
    defaultValue: '',
    disabled: false,
    value: '',
    showCharCount: true
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      value: props.value,
      charCount: props.value ? props.value.length : 0
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.value !== nextProps.value) {
      let charCount = 0

      if (nextProps.value) {
        charCount = nextProps.value.length
        this.setState({
          charCount
        }) // this.props.setValue(nextProps.value)
      }
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
      <>
        <div
          style={{
            width: '100%'
          }}
        >
          <Tooltip title={tooltip} placement={tooltipPosition}>
            <label htmlFor={id || name}>
              {label} {isRequired && '*'}
            </label>
            <Input
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
          </Tooltip>
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
                color: 'green'
              }}
            >
              {successText}
            </p>
          )}
        </div>
      </>
    )
  }
}

export default withFormsy(TextInput) as any
