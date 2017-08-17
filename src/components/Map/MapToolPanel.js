//@flow
import React from 'react';
var $ = require('jquery');
import EditBaseMapBox from './EditBaseMapBox';
import BaseMapSelection from './BaseMapSelection';
import Formsy from 'formsy-react';
import Toggle from '../forms/toggle';
import AnimationActions from '../../actions/map/AnimationActions';
import MapHubsComponent from '../../components/MapHubsComponent';

type Props = {|
  show: boolean,
  gpxLink: string,
  onChangeBaseMap:  Function,
  toggleMeasurementTools:  Function,
  toggleForestAlerts: Function,
  toggleForestLoss:Function,
  calculateForestAlerts: Function,
  enableMeasurementTools:  boolean,
  forestAlerts: Object,
  forestLoss: Object,
  height: string
|}

type DefaultProps = {|
   show: boolean,
  enableMeasurementTools: boolean,
  forestAlerts: Object,
  forestLoss: Object
|}

export default class MapToolPanel extends MapHubsComponent<Props, void> {

  props: Props

  static defaultProps: DefaultProps = {
    show: false,
    enableMeasurementTools: false,
    forestAlerts: {
      enableGLAD2017: false,
      result: null
    },
    forestLoss: {
      enableForestLoss: false,
      result: null
    }
  }

  componentDidMount(){
    $(this.refs.mapToolButton).tooltip();
    $(this.refs.mapToolButton).sideNav({
        menuWidth: 240, // Default is 240
        edge: 'right', // Choose the horizontal origin
        closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
        draggable: false // Choose whether you can drag to open on touch screens
      });
    $(this.refs.mapToolPanel).collapsible();
  }

  closePanel = () => {
    $(this.refs.mapToolButton).sideNav('hide');
  }

  onChangeBaseMap = (val: string) => {
    this.closePanel();
    this.props.onChangeBaseMap(val);
  }

   toggleMeasurementTools = (model: {enableMeasurementTools: boolean}) => {
    if(model.enableMeasurementTools) this.closePanel();
    this.props.toggleMeasurementTools(model.enableMeasurementTools);
  }

   toggleForestAlerts = (model: Object) => {
     //leave panel open for this tool?
    //if(model.enableGLAD2017) this.closePanel();
    this.props.toggleForestAlerts(model);
  }

  toggleForestLoss = (model: Object) => {
    this.props.toggleForestLoss(model);
  }

  render(){
    var forestAlertsResult = '';
    if(this.props.forestAlerts.result){
      forestAlertsResult = (
        
        <div>
          <div className="row no-margin">
            <div className="col s12" style={{height: '50px', border: '1px solid #ddd'}}>
              <span><b>{this.__('Alert Count: ')}</b>{this.props.forestAlerts.result.alertCount}</span>         
            </div>                
          </div>
          <div className="row no-margin">
            <div className="col s12" style={{height: '50px', border: '1px solid #ddd'}}>
              <span><b>{this.__('Total Area: ')}</b>{this.props.forestAlerts.result.areaMessage}</span>
            </div>                
          </div>        
        </div>
      );
    }
  
    return (
      <div> 
         <a ref="mapToolButton"
          href="#" 
          data-activates="map-tool-panel"
          style={{
            display: this.props.show ? 'inherit' : 'none',
            position: 'absolute',         
            top: '10px',            
            right: '10px',
            height:'30px',
            zIndex: '100',
            borderRadius: '4px',
            lineHeight: '30px',
            textAlign: 'center',
            boxShadow: '0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)',
            width: '30px'
          }}
            data-position="bottom" data-delay="50" 
            data-tooltip={this.__('Tools')}
          >
          <i  className="material-icons"
            style={{height:'30px',
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
                    fontSize:'18px'}}          
            >build</i>
        </a>
        <div className="side-nav" id="map-tool-panel"
              style={{
                backgroundColor: '#FFF',              
                height: '100%', 
                padding: 0,
                position: 'absolute',
                border: '1px solid #d3d3d3'}}>
            
            <ul ref="mapToolPanel" className="collapsible no-margin" data-collapsible="accordion" style={{height: '100%'}}>
            <li>
              <div className="collapsible-header" style={{borderBottom: '1px solid #ddd'}}><i className="material-icons">layers</i>{this.__('Change Base Map')}</div>
              <div className="collapsible-body">
                <div style={{height: `calc(${this.props.height} - 250px)`, overflow: 'auto'}}>
                  <BaseMapSelection onChange={this.onChangeBaseMap}/>
                </div>
              </div>
            </li>
            <li>
              <div className="collapsible-header" style={{borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd'}}><i className="material-icons">straighten</i>{this.__('Measurement Tools')}</div>
              <div className="collapsible-body center">
                <div style={{height: `calc(${this.props.height} - 250px)`, overflow: 'auto'}}>              
                  <Formsy.Form onChange={this.toggleMeasurementTools}>
                   <b>{this.__('Show Measurement Tools')}</b>          
                    <Toggle name="enableMeasurementTools"
                        labelOff={this.__('Off')} labelOn={this.__('On')}                       
                        className="col s12"
                        checked={this.props.enableMeasurementTools}
                    />                     
                  </Formsy.Form>                 
                </div>
              </div>
            </li>
            <li>
              <div className="collapsible-header" style={{borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd'}}><i className="material-icons">warning</i>{this.__('Forest Alerts')}</div>
              <div className="collapsible-body center">
                <div style={{height: `calc(${this.props.height} - 250px)`, overflow: 'auto'}}>              
                  <Formsy.Form onChange={this.toggleForestAlerts}>
                   <b>{this.__('2017 GLAD Alerts')}</b>          
                    <Toggle name="enableGLAD2017"
                        labelOff={this.__('Off')} labelOn={this.__('On')}                       
                        className="col s12"
                        checked={this.props.forestAlerts.enableGLAD2017}
                    />                     
                  </Formsy.Form>             
                  <button className="btn" onClick={this.props.calculateForestAlerts}>{this.__('Calculate')}</button>     
                  {forestAlertsResult}
                  <Formsy.Form onChange={this.toggleForestLoss}>
                   <b>{this.__('2001 - 2014 Forest Loss')}</b>          
                    <Toggle name="enableForestLoss"
                        labelOff={this.__('Off')} labelOn={this.__('On')}                       
                        className="col s12"
                        checked={this.props.forestLoss.enableForestLoss}
                    />                     
                  </Formsy.Form>    
                  <button className="btn-floating" style={{marginRight: '5px'}} onClick={AnimationActions.play}><i className="material-icons">play_arrow</i></button> 
                  <button className="btn-floating" onClick={AnimationActions.stop}><i className="material-icons">pause</i></button> 
                </div>
              </div>
            </li>
            <li>
              <div className="collapsible-header" style={{borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd'}}><i className="material-icons">edit</i>{this.__('Edit OpenStreetMap')}</div>
              <div className="collapsible-body">
                <div style={{height: `calc(${this.props.height} - 250px)`, overflow: 'auto'}}>
                  <EditBaseMapBox gpxLink={this.props.gpxLink}/>
                </div>
              </div>
            </li>
        </ul>

        </div>
      </div>
    );
  }
}