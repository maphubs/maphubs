// @flow
import React from 'react'
import EditBaseMapBox from './ToolPanels/EditBaseMapBox'
import BaseMapSelection from './ToolPanels/BaseMapSelection'
import MeasurementToolPanel from './ToolPanels/MeasurementToolPanel'
import IsochronePanel from './ToolPanels/IsochronePanel'
// import AreaComparisonPanel from './ToolPanels/AreaComparisonPanel'
import MapToolButton from './MapToolButton'
import { Drawer, Collapse } from 'antd'

const Panel = Collapse.Panel

type Props = {|
  show: boolean,
  gpxLink?: string,
  onChangeBaseMap: Function,
  toggleMeasurementTools: Function,
  enableMeasurementTools: boolean,
  getIsochronePoint: Function,
  clearIsochroneLayers: Function,
  measureFeatureClick: Function,
  isochroneResult?: Object,
  t: Function
|}

type State = {
  open?: boolean
}

export default class MapToolPanel extends React.Component<Props, State> {
  constructor (props: Props) {
    super()
    this.state = {}
  }

  drawerContainer: any

  static defaultProps = {
    show: false,
    enableMeasurementTools: false
  }

  onSetOpen = (open: boolean) => {
    this.setState({ open })
  }

  onChangeBaseMap = (val: string) => {
    this.onSetOpen(false)
    this.props.onChangeBaseMap(val)
  }

  render () {
    const {t, show, gpxLink} = this.props
    return (
      <div>
        <MapToolButton
          tooltipText={t('Tools')}
          top='10px'
          right='10px'
          show={show}
          icon='build'
          onClick={() => this.onSetOpen(true)}
        />
        <div ref={(el) => { this.drawerContainer = el }} />
        <Drawer
          getContainer={() => this.drawerContainer}
          title={t('Tools')}
          visible={this.state.open}
          onClose={() => { this.onSetOpen(false) }}
          placement='right'
          bodyStyle={{padding: 0}}
          width='320px'
        >
          <div style={{height: '100%', border: 'solid 1px #ddd'}}>
            <Collapse accordion>
              <Panel header={t('Change Base Map')} key='basemap'>
                <BaseMapSelection onChange={this.onChangeBaseMap} t={t} />
              </Panel>
              <Panel header={t('Measurement Tools')} key='measurement'>
                <MeasurementToolPanel
                  enableMeasurementTools={this.props.enableMeasurementTools}
                  toggleMeasurementTools={this.props.toggleMeasurementTools}
                  measureFeatureClick={this.props.measureFeatureClick}
                  closePanel={() => { this.onSetOpen(false) }}
                  t={t}
                />
              </Panel>
              <Panel header={t('Travel Time')} key='traveltime'>
                <IsochronePanel getIsochronePoint={this.props.getIsochronePoint} clearIsochroneLayers={this.props.clearIsochroneLayers} isochroneResult={this.props.isochroneResult} t={t} />
              </Panel>
              <Panel header={t('Edit OpenStreetMap')} key='osm'>
                <EditBaseMapBox gpxLink={gpxLink} t={t} />
              </Panel>
            </Collapse>
          </div>
        </Drawer>
      </div>
    )
  }
}
