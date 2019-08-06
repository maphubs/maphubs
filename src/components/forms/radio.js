// @flow
import React from 'react'
import {withFormsy} from 'formsy-react'
import {Tooltip} from 'antd'
import MapHubsPureComponent from '../MapHubsPureComponent'

type Props = {
  className: string,
  dataTooltip: string,
  dataPosition: string,
  defaultValue: string,
  label: string,
  name: string,
  onChange: Function,
  options: Array<{value: string, label: string}>,
  setValue: Function,
  getValue: Function
}

class Radio extends MapHubsPureComponent<Props, void> {
  props: Props

  static defaultProps = {
    options: {},
    defaultValue: null,
    dataDelay: 100
  }

  componentWillMount () {
    super.componentWillMount()
    this.props.setValue(this.props.defaultValue)
  }

  changeValue = (event) => {
    this.props.setValue(event.target.id)
    this.setState({value: event.target.id})
    if (this.props.onChange) {
      this.props.onChange(event.target.id)
    }
  }

  render () {
    const {name, className, dataPosition, dataTooltip, options, label} = this.props
    const value = this.props.getValue()
    const _this = this

    return (
      <Tooltip
        title={dataTooltip}
        placement={dataPosition}
      >
        <div className={className}>

          <label>{label}</label>
          {options.map((option) => {
            let checked = false
            if (option.value === value) {
              checked = true
            }
            return (<p key={option.value}>
              <label>
                <input name={name} type='radio' id={option.value} onChange={_this.changeValue} checked={checked} />
                <span>{option.label}</span>
              </label>
            </p>)
          })}
        </div>
      </Tooltip>
    )
  }
}
export default withFormsy(Radio)
