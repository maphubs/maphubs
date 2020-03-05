// @flow
import React from 'react'
import {withFormsy} from 'formsy-react'
import MapHubsComponent from '../MapHubsComponent'
import _isequal from 'lodash.isequal'
import {Tooltip} from 'antd'
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
  showRequired: boolean,
  isValid: boolean,
  showError: boolean,
  setValue: Function,
  errorMessage: string
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

  constructor (props: Props) {
    super(props)
    this.state = {
      value: props.value,
      charCount: props.value ? props.value.length : 0
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
    const { icon, name, label, errorMessage, dataTooltip, dataPosition, length } = this.props
    const { value, charCount } = this.state
    const className = classNames('input-field', this.props.className)
    const textAreaClassName = classNames(
      'materialize-textarea',
      {
        required: this.props.showRequired,
        valid: this.props.isValid,
        invalid: this.props.showError
      }
    )

    return (
      <Tooltip title={dataTooltip} position={dataPosition}>
        <div ref='inputWrapper' className={className}>
          {icon &&
            <i className='material-icons prefix'>{icon}</i>}
          <textarea ref='textarea' id={name} className={textAreaClassName} value={value} onChange={this.changeValue} />
          <label htmlFor={name} className={value ? 'active' : ''} data-error={errorMessage} data-success=''>{label}</label>
          <span
            className='character-counter'
            style={{float: 'right', fontSize: '12px', height: '1px', color: charCount > length ? 'red' : 'black'}}
          >
            {charCount} / {length}
          </span>
        </div>
      </Tooltip>
    )
  }
}
export default withFormsy(TextArea)
