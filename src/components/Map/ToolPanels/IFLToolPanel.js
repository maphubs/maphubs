// @flow
import React from 'react'
import MapHubsPureComponent from '../../MapHubsPureComponent'
import Formsy from 'formsy-react'
import Toggle from '../../forms/toggle'

type Props = {|
  enableMeasurementTools: boolean,
  closePanel: Function,
  toggleMeasurementTools: Function
|}

export default class IFLToolPanel extends MapHubsPureComponent<Props, void> {
  props: Props

  toggleMeasurementTools = (model: {enableMeasurementTools: boolean}) => {
    if (model.enableMeasurementTools) this.props.closePanel()
    this.props.toggleMeasurementTools(model.enableMeasurementTools)
  }

  render () {
    return (
      <Formsy onChange={this.toggleMeasurementTools}>
        <p>{this.__('Step 1: Select IFL')}</p>
        <p>{this.__('Step 2: Draw Disturbances')}</p>
        <p>{this.__('Step 3: Measure')}</p>
        <p>{this.__('Step 4: Calculate')}</p>
      </Formsy>
    )
  }
}
