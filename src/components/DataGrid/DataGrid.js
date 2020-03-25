// @flow
import React from 'react'
import { Row } from 'antd'
import EditableTable from './EditableTable'
import MapContainer from '../Map/containers/MapContainer'
import { subscribe } from '../Map/containers/unstated-props'

type Props = {
  geoJSON: Object,
  presets: Object,
  height: number,
  onRowSelected: Function,
  layer_id: number,
  dataLoadingMsg: string,
  canEdit: boolean,
  onSave?: Function,
  presets: Array<MapHubsField>,
  containers: Array<Object>
}

type State = {

}

class DataGrid extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <Row>
        <EditableTable />
      </Row>
    )
  }
}
export default subscribe(DataGrid, {
  mapState: MapContainer
})
