// @flow
import React from 'react'
import { Switch } from 'antd'

type Props = {|
  enableMeasurementTools: boolean,
  closePanel: Function,
  toggleMeasurementTools: Function,
  t: Function
|}

export default class MeasurementToolPanel extends React.PureComponent<Props, void> {
  props: Props

  toggleMeasurementTools = (enableMeasurementTools: boolean) => {
    if (enableMeasurementTools) this.props.closePanel()
    this.props.toggleMeasurementTools(enableMeasurementTools)
  }

  render () {
    const {t, enableMeasurementTools} = this.props
    return (
      <div style={{textAlign: 'center'}}>
        <b>{t('Show Measurement Tools')}</b>
        <div>
          <Switch checked={enableMeasurementTools} onChange={this.toggleMeasurementTools} />
        </div>
      </div>
    )
  }
}
