// @flow
import React from 'react'
import EditBaseMapBox from './ToolPanels/EditBaseMapBox'
import BaseMapSelection from './ToolPanels/BaseMapSelection'
import MeasurementToolPanel from './ToolPanels/MeasurementToolPanel'
import IsochronePanel from './ToolPanels/IsochronePanel'
// import AreaComparisonPanel from './ToolPanels/AreaComparisonPanel'
import {Tooltip} from 'react-tippy'

type Props = {|
  show: boolean,
  gpxLink?: string,
  onChangeBaseMap: Function,
  toggleMeasurementTools: Function,
  enableMeasurementTools: boolean,
  getIsochronePoint: Function,
  clearIsochroneLayers: Function,
  isochroneResult?: Object,
  height: string,
  t: Function
|}

export default class MapToolPanel extends React.Component<Props, void> {
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

  render () {
    const {t, show, height, gpxLink} = this.props
    return (
      <div>
        <Tooltip
          title={t('Tools')}
          position='bottom' inertia followCursor
        >
          <a ref='mapToolButton'
            href='#'
            className='sidenav-trigger'
            data-target='map-tool-panel'
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
        <div ref='sidenav' className='sidenav' id='map-tool-panel'
          style={{
            backgroundColor: '#FFF',
            height: 'calc(100% - 25px)',
            width: '240px',
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: '25px',
            paddingBottom: 0,
            position: 'absolute',
            border: '1px solid #d3d3d3'}}>
          <a className='omh-color' style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}} onClick={this.closePanel}>
            <i className='material-icons selected-feature-close' style={{fontSize: '20px'}}>close</i>
          </a>
          <ul ref='mapToolPanel' className='collapsible no-margin' data-collapsible='accordion' style={{height: '100%'}}>
            <li>
              <div className='collapsible-header' style={{borderBottom: '1px solid #ddd'}}><i className='material-icons'>layers</i>{t('Change Base Map')}</div>
              <div className='collapsible-body'>
                <div style={{height: `calc(${height} - 250px)`, overflow: 'auto'}}>
                  <BaseMapSelection onChange={this.onChangeBaseMap} t={t} />
                </div>
              </div>
            </li>
            <li>
              <div className='collapsible-header' style={{borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd'}}><i className='material-icons'>straighten</i>{t('Measurement Tools')}</div>
              <div className='collapsible-body center'>
                <div style={{height: `calc(${height} - 250px)`, overflow: 'auto'}}>
                  <MeasurementToolPanel {...this.props} closePanel={this.closePanel} />
                </div>
              </div>
            </li>
            <li>
              <div className='collapsible-header' style={{borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd'}}><i className='material-icons'>access_time</i>{t('Travel Time')}</div>
              <div className='collapsible-body center'>
                <div style={{height: `calc(${height} - 250px)`, overflow: 'auto'}}>
                  <IsochronePanel getIsochronePoint={this.props.getIsochronePoint} clearIsochroneLayers={this.props.clearIsochroneLayers} isochroneResult={this.props.isochroneResult} t={t} />
                </div>
              </div>
            </li>
            <li>
              <div className='collapsible-header' style={{borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd'}}><i className='material-icons'>edit</i>{t('Edit OpenStreetMap')}</div>
              <div className='collapsible-body'>
                <div style={{height: `calc(${height} - 250px)`, overflow: 'auto'}}>
                  <EditBaseMapBox gpxLink={gpxLink} t={t} />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}
