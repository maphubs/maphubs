var React = require('react');
var $ = require('jquery');

var EditBaseMapBox = require('./EditBaseMapBox');
var BaseMapSelection = require('./BaseMapSelection');

var Formsy = require('formsy-react');
var Toggle = require('../forms/toggle');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var MapToolPanel = React.createClass({

   mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    show: React.PropTypes.bool,
    gpxLink: React.PropTypes.string,
    onChangeBaseMap:  React.PropTypes.func.isRequired,
    toggleMeasurementTools:  React.PropTypes.func.isRequired,
    enableMeasurementTools:  React.PropTypes.bool
  },

  getDefaultProps(){
    return {
      show: false,
      buttonTooltipText: '',
      enableMeasurementTools: false
    };
  },

  componentDidMount(){
    $(this.refs.mapToolButton).tooltip();
    $(this.refs.mapToolButton).sideNav({
        menuWidth: 240, // Default is 240
        edge: 'right', // Choose the horizontal origin
        closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
        draggable: false // Choose whether you can drag to open on touch screens
      });
    $(this.refs.mapToolPanel).collapsible();
  },

  closePanel(){
    $(this.refs.mapToolButton).sideNav('hide');
  },

  onChangeBaseMap(val){
    this.closePanel();
    this.props.onChangeBaseMap(val);
  },

   toggleMeasurementTools(model){
    if(model.enableMeasurementTools) this.closePanel();
    this.props.toggleMeasurementTools(model.enableMeasurementTools);
  },


  render(){

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
                height: 'calc(100% - 100px)', 
                overflow: 'hidden',
                padding: 0, marginTop: '50px',
                border: 'none', boxShadow: 'none'}}>
            
            <ul ref="mapToolPanel" className="collapsible no-margin" data-collapsible="accordion" style={{height: '100%'}}>
            <li>
              <div className="collapsible-header" style={{borderBottom: '1px solid #ddd'}}><i className="material-icons">layers</i>{this.__('Change Base Map')}</div>
              <div className="collapsible-body">
                <div style={{height: 'calc(100vh - 250px)', overflow: 'auto'}}>
                  <BaseMapSelection onChange={this.onChangeBaseMap}/>
                </div>
              </div>
            </li>
            <li>
              <div className="collapsible-header" style={{borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd'}}><i className="material-icons">straighten</i>{this.__('Measurement Tools')}</div>
              <div className="collapsible-body center">
                <div style={{height: 'calc(100vh - 250px)', overflow: 'auto'}}>              
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
              <div className="collapsible-header" style={{borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd'}}><i className="material-icons">edit</i>{this.__('Edit OpenStreetMap')}</div>
              <div className="collapsible-body">
                <div style={{height: 'calc(100vh - 250px)', overflow: 'auto'}}>
                  <EditBaseMapBox gpxLink={this.props.gpxLink}/>
                </div>
              </div>
            </li>
        </ul>

        </div>
      </div>
    );
  }

});

module.exports = MapToolPanel;