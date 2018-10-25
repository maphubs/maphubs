// @flow
import React from 'react'
import EditBaseMapBox from './ToolPanels/EditBaseMapBox'
import BaseMapSelection from './ToolPanels/BaseMapSelection'
import MeasurementToolPanel from './ToolPanels/MeasurementToolPanel'
import IsochronePanel from './ToolPanels/IsochronePanel'
// import AreaComparisonPanel from './ToolPanels/AreaComparisonPanel'
import {Tooltip} from 'react-tippy'
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
        <Tooltip
          title={t('Tools')}
          position='bottom' inertia followCursor
        >
          <a
            href='#'
            onClick={() => this.onSetOpen(true)}
            style={{
              display: show ? 'inherit' : 'none',
              position: 'absolute',
              top: '10px',
              right: '10px',
              height: '30px',
              zIndex: '100',
              borderRadius: '4px',
              lineHeight: '30px',
              textAlign: 'center',
              boxShadow: '0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)',
              width: '30px'
            }}
          >
            <i className='material-icons'
              style={{height: '30px',
                lineHeight: '30px',
                width: '30px',
                color: '#000',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: 'white',
                borderColor: '#ddd',
                borderStyle: 'none',
                borderWidth: '1px',
                textAlign: 'center',
                fontSize: '18px'}}
            >build</i>
          </a>
        </Tooltip>
        <div ref={(el) => { this.drawerContainer = el }} />
        <Drawer
          getContainer={() => this.drawerContainer}
          open={this.state.open}
          onMaskClick={() => { this.onSetOpen(false) }}
          handler={false}
          level={null}
          placement='right'
          width='240px'
        >
          <a className='omh-color' style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer', zIndex: '9999'}} onClick={() => { this.onSetOpen(false) }}>
            <i className='material-icons selected-feature-close' style={{fontSize: '20px'}}>close</i>
          </a>
          <div style={{height: '100%', border: 'solid 1px #ddd'}}>
            <Collapse accordion>
              <Panel header={t('Change Base Map')} key='basemap'>
                <BaseMapSelection onChange={this.onChangeBaseMap} t={t} />
              </Panel>
              <Panel header={t('Measurement Tools')} key='measurement'>
                <MeasurementToolPanel enableMeasurementTools={this.props.enableMeasurementTools} toggleMeasurementTools={this.props.toggleMeasurementTools} closePanel={() => { this.onSetOpen(false) }} t={t} />
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
