// @flow
import React from 'react'
import EditBaseMapBox from './ToolPanels/EditBaseMapBox'
import BaseMapSelection from './ToolPanels/BaseMapSelection'
import MeasurementToolPanel from './ToolPanels/MeasurementToolPanel'
// import ForestAlertPanel from './ToolPanels/ForestAlertPanel'
import IsochronePanel from './ToolPanels/IsochronePanel'
import MapHubsComponent from '../../components/MapHubsComponent'
import AreaComparisonPanel from './ToolPanels/AreaComparisonPanel'
import {Tooltip} from 'react-tippy'

type Props = {|
  show: boolean,
  gpxLink: string,
  onChangeBaseMap: Function,
  toggleMeasurementTools: Function,
  enableMeasurementTools: boolean,
  getIsochronePoint: Function,
  clearIsochroneLayers: Function,
  isochroneResult: Object,
  height: string
|}

export default class MapToolPanel extends MapHubsComponent<Props, void> {
  props: Props

  static defaultProps = {
    show: false,
    enableMeasurementTools: false
  }

  componentDidMount () {
    M.Sidenav.init(this.refs.sidenav, {
      edge: 'right',
      draggable: false
    })
    M.Collapsible.init(this.refs.mapToolPanel, {})
  }

  closePanel = () => {
    M.Sidenav.getInstance(this.refs.sidenav).close()
  }

  onChangeBaseMap = (val: string) => {
    this.closePanel()
    this.props.onChangeBaseMap(val)
  }

   toggleForestAlerts = (model: Object) => {
     // leave panel open for this tool?
     // if(model.enableGLAD2017) this.closePanel();
     // this.props.toggleForestAlerts(model)
   }

  toggleForestLoss = (model: Object) => {
    // this.props.toggleForestLoss(model)
  }

  render () {
    return (
      <div>
        <Tooltip
          title={this.__('Tools')}
          position='bottom' inertia followCursor
        >
          <a ref='mapToolButton'
            href='#'
            className='sidenav-trigger'
            data-target='map-tool-panel'
            style={{
              display: this.props.show ? 'inherit' : 'none',
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
        <div ref='sidenav' className='sidenav' id='map-tool-panel'
          style={{
            backgroundColor: '#FFF',
            height: '100%',
            width: '240px',
            padding: 0,
            position: 'absolute',
            border: '1px solid #d3d3d3'}}>

          <ul ref='mapToolPanel' className='collapsible no-margin' data-collapsible='accordion' style={{height: '100%'}}>
            <li>
              <div className='collapsible-header' style={{borderBottom: '1px solid #ddd'}}><i className='material-icons'>layers</i>{this.__('Change Base Map')}</div>
              <div className='collapsible-body'>
                <div style={{height: `calc(${this.props.height} - 250px)`, overflow: 'auto'}}>
                  <BaseMapSelection onChange={this.onChangeBaseMap} />
                </div>
              </div>
            </li>
            <li>
              <div className='collapsible-header' style={{borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd'}}><i className='material-icons'>straighten</i>{this.__('Measurement Tools')}</div>
              <div className='collapsible-body center'>
                <div style={{height: `calc(${this.props.height} - 250px)`, overflow: 'auto'}}>
                  <MeasurementToolPanel {...this.props} closePanel={this.closePanel} />
                </div>
              </div>
            </li>
            <li>
              <div className='collapsible-header' style={{borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd'}}><i className='material-icons'>warning</i>{this.__('Forest Alerts')}</div>
              <div className='collapsible-body center'>
                <div style={{height: `calc(${this.props.height} - 250px)`, overflow: 'auto'}}>
                  <AreaComparisonPanel {...this.props} />
                </div>
              </div>
            </li>
            <li>
              <div className='collapsible-header' style={{borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd'}}><i className='material-icons'>access_time</i>{this.__('Travel Time')}</div>
              <div className='collapsible-body center'>
                <div style={{height: `calc(${this.props.height} - 250px)`, overflow: 'auto'}}>
                  <IsochronePanel {...this.props} />
                </div>
              </div>
            </li>
            <li>
              <div className='collapsible-header' style={{borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd'}}><i className='material-icons'>edit</i>{this.__('Edit OpenStreetMap')}</div>
              <div className='collapsible-body'>
                <div style={{height: `calc(${this.props.height} - 250px)`, overflow: 'auto'}}>
                  <EditBaseMapBox gpxLink={this.props.gpxLink} />
                </div>
              </div>
            </li>
          </ul>

        </div>
      </div>
    )
  }
}
