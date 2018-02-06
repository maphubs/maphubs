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

export default class AreaComparisonPanel extends MapHubsPureComponent<Props, void> {
  props: Props

  areaSelected = (selected: string) => {
    if (selected === 'central-park') {
      // get the center point of the map
      // calc angle between center and centroid
      // calc distance 

      // run transfrom

      // add geojson layer to the map
    }
  }

  render () {
    return (
      <Formsy onChange={this.toggleMeasurementTools}>
        <b>{this.__('Select An Area')}</b>
        coming soon!
      </Formsy>
    )
  }
}
