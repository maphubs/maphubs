import React from 'react'
import { Radio, Tooltip } from 'antd'
import { withFormsy } from 'formsy-react'
type Props = {
  tooltip: string
  tooltipPosition: string
  defaultValue?: string
  label: string
  onChange: (...args: Array<any>) => void
  options: Array<{
    value: string
    label: string
  }>
  setValue: (...args: Array<any>) => void
}

class RadioForm extends React.Component<Props> {
  static defaultProps = {
    options: {},
    dataDelay: 100
  }

  componentDidMount() {
    this.props.setValue(this.props.defaultValue)
  }

  changeValue = (event) => {
    this.props.setValue(event.target.value)

    if (this.props.onChange) {
      this.props.onChange(event.target.value)
    }
  }

  render() {
    const { tooltipPosition, tooltip, options, label, defaultValue } =
      this.props
    return (
      <Tooltip title={tooltip} placement={tooltipPosition}>
        <>
          <label>{label}</label>
          <Radio.Group onChange={this.changeValue} defaultValue={defaultValue}>
            {options.map((option) => (
              <Radio key={option.value} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        </>
      </Tooltip>
    )
  }
}

export default withFormsy(RadioForm) as any
