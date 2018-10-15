// @flow
import React from 'react'
import Formsy from 'formsy-react'
import Toggle from '../../forms/toggle'

type Props = {|
  enableMeasurementTools: boolean,
  closePanel: Function,
  toggleMeasurementTools: Function,
  t: Function
|}

export default class MeasurementToolPanel extends React.PureComponent<Props, void> {
  props: Props

  toggleMeasurementTools = (model: {enableMeasurementTools: boolean}) => {
    if (model.enableMeasurementTools) this.props.closePanel()
    this.props.toggleMeasurementTools(model.enableMeasurementTools)
  }

  render () {
    const {t, enableMeasurementTools} = this.props
    return (
      <Formsy onChange={this.toggleMeasurementTools}>
        <b>{t('Show Measurement Tools')}</b>
        <Toggle name='enableMeasurementTools'
          labelOff={t('Off')} labelOn={t('On')}
          className='col s12'
          checked={enableMeasurementTools}
        />
      </Formsy>
    )
  }
}
