import React from 'react'
import { withFormsy } from 'formsy-react'

import { Tooltip, Switch } from 'antd'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('Toggle')
type Props = {
  className: string
  tooltip: string
  dataDelay: number
  tooltipPosition: string
  labelOn: string
  labelOff: string
  name: string
  style: Record<string, any>
  disabled: boolean
  onChange: (...args: Array<any>) => any
  defaultChecked: boolean
  checked: boolean
  setValue: (...args: Array<any>) => any
  value: boolean
}

class Toggle extends React.Component<Props> {
  props: Props
  static defaultProps = {
    style: {},
    defaultChecked: false,
    dataDelay: 100,
    disabled: false
  }

  componentDidMount() {
    if ('checked' in this.props) {
      this.props.setValue(this.props.checked)
    } else {
      this.props.setValue(this.props.defaultChecked)
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    // only change if the props value is swapped
    const currentValue = this.props.checked

    if ('checked' in nextProps && nextProps.checked !== currentValue) {
      this.props.setValue(nextProps.checked)
    }
  }

  changeValue = (checked) => {
    debug.log('change value: ' + checked)

    if (checked !== this.props.value) {
      this.props.setValue(checked)
    }

    if (this.props.onChange) {
      this.props.onChange(checked)
    }
  }

  render() {
    const { value, labelOff, labelOn, tooltip, tooltipPosition, disabled } =
      this.props
    return (
      <Tooltip title={tooltip} placement={tooltipPosition}>
        <style jsx>
          {`
            .toggle-label {
              margin-right: 5px;
              margin-left: 5px;
              font-weight: bold;
              font-size: 12px;
            }
          `}
        </style>
        <span className='toggle-label'>{labelOff}</span>
        <Switch
          disabled={disabled}
          checked={value}
          onChange={this.changeValue}
        />
        <span className='toggle-label'>{labelOn}</span>
      </Tooltip>
    )
  }
}

export default withFormsy(Toggle) as any
