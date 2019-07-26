// @flow
import React from 'react'
import Close from '@material-ui/icons/Close'
import EditBaseMapBox from './ToolPanels/EditBaseMapBox'
import BaseMapSelection from './ToolPanels/BaseMapSelection'
import MeasurementToolPanel from './ToolPanels/MeasurementToolPanel'
import IsochronePanel from './ToolPanels/IsochronePanel'
// import AreaComparisonPanel from './ToolPanels/AreaComparisonPanel'
import MapToolButton from './MapToolButton'
import Drawer from 'rc-drawer'
import { Collapse } from 'antd'
import 'rc-drawer/assets/index.css'

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

  static defaultProps = {
    show: false,
    enableMeasurementTools: false
  }

  drawerContainer: any

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
          open={this.state.open}
          onMaskClick={() => { this.onSetOpen(false) }}
          handler={false}
          level={null}
          placement='right'
          width='320px'
        >
          <a
            className='omh-color'
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              cursor: 'pointer',
              zIndex: '9999',
              height: '20px'
            }}
            onClick={() => { this.onSetOpen(false) }}
          >
            <Close style={{fontSize: '20px', color: 'white'}} />
          </a>
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
