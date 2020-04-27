// @flow
import React from 'react'
import { Switch, Button } from 'antd'

type Props = {|
  enableMeasurementTools: boolean,
  closePanel: Function,
  toggleMeasurementTools: Function,
  measureFeatureClick: Function,
  t: Function
|}

export default class MeasurementToolPanel extends React.Component<Props, void> {
  props: Props

  toggleMeasurementTools = (enableMeasurementTools: boolean) => {
    if (enableMeasurementTools) this.props.closePanel()
    this.props.toggleMeasurementTools(enableMeasurementTools)
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    const {t, enableMeasurementTools} = this.props
    return (
      <div style={{textAlign: 'center'}}>
        <b>{t('Show Measurement Tools')}</b>
        <div>
          <Switch checked={enableMeasurementTools} onChange={this.toggleMeasurementTools} />
        </div>
        <div style={{marginTop: '20px'}}>
          <Button type='primary' onClick={this.props.measureFeatureClick}>{t('Select a Feature')}</Button>
        </div>
      </div>
    )
  }
}
