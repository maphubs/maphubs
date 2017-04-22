//@flow
import React from 'react';
var $ = require('jquery');
import BaseMapStore from '../../stores/map/BaseMapStore';
import LegendItem from './LegendItem';
import MapHubsComponent from '../../components/MapHubsComponent';

export default class MiniLegend extends MapHubsComponent {

  props: {
    title: string,
    layers: Array<Object>,
    hideInactive: boolean,
    collapsible: boolean,
    collapseToBottom: boolean,
    showLayersButton: boolean,
    style: Object
  }

  static defaultProps: {
    layers: [],
    hideInactive: true,
    collapsible: true,
    collapseToBottom: false,
    showLayersButton: true,
    style: {}
  }

  state: {
    collapsed: false
  }

  constructor(props: Object){
		super(props);
    this.stores.push(BaseMapStore);
	}

  toggleCollapsed(){
    this.setState({
      collapsed: this.state.collapsed ? false : true
    });
  }

  componentDidMount() {
    if(this.props.collapsible){
       $(this.refs.legend).collapsible();
    }
   
    if(this.props.showLayersButton){
      $(this.refs.mapLayersButton).sideNav({
        menuWidth: 240, // Default is 240
        edge: 'left', // Choose the horizontal origin
        closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
      });
    }
  }

  render(){
    var _this = this;

    var layersButton = '';
    if(this.props.showLayersButton){
      layersButton = (
         <a ref="mapLayersButton"
                href="#" 
                data-activates="map-layers"
                style={{
                  position: 'absolute',
                  right: '20px',
                  display: 'inherit',
                  height:'32px',
                  zIndex: '100',
                  borderRadius: '4px',
                  lineHeight: '32px',
                  textAlign: 'center',
                  width: '32px'
                }}
                  data-position="bottom" data-delay="50" 
                  data-tooltip={this.__('Tools')}
                >
                <i  className="material-icons"
                  style={{height:'32px',
                          lineHeight: '32px',
                          width: '32px',
                          color: '#000',  
                          cursor: 'pointer',
                          borderStyle: 'none',
                          textAlign: 'center',
                          fontSize:'18px'}}          
                  >settings</i>
              </a>
      );
    }

    var titleText = '';
    if(this.props.title && this.props.title != ''){
      titleText = this.props.title;
    }else{
      titleText = this.__('Legend');
    }

    var title = '';
    if(this.props.collapsible){

      var iconName;
      if(this.props.collapseToBottom){
        if(this.state.collapsed){
          iconName = 'keyboard_arrow_up';
        }else{
          iconName = 'keyboard_arrow_down';
        }
      }else{
         if(this.state.collapsed){
          iconName = 'keyboard_arrow_down';
        }else{
          iconName = 'keyboard_arrow_up';
        }
      }
     
      title = (
        <div className="row no-margin" style={{height: '32px'}}>
          <div className="col s10 no-padding valign-wrapper" style={{height: '32px'}}>
            <h6 className="black-text valign word-wrap" style={{padding: '0.2rem', marginLeft: '2px', marginTop: '0px', marginBottom: '2px', fontWeight: '500'}}>{titleText}</h6>
          </div>
          <div className="col s2 no-padding valign">
            {layersButton}
            <i ref="titleIcon" className="material-icons icon-fade-in" style={{float: 'right', marginRight: 0, height: '100%', lineHeight: '32px'}}>{iconName}</i>
          </div>
        </div>
      );
    }else{
      title = (
        <div className="row no-margin valign-wrapper" style={{height: '44px'}}>
          <h6 className="black-text valign" style={{padding: '0.2rem',  marginLeft: '2px', fontWeight: '500'}}>{titleText}</h6>
          <div className="col s2 no-padding valign">
            {layersButton}
          </div>
        </div>
      );
    }

     var allowScroll = true;
    if(this.state.collapsed || this.props.layers.length==1){
      allowScroll = false;
    }

    //var style = this.props.style;
    //style.height = '9999px'; //needed for the flex box to work correctly

    return (
      <div style={this.props.style}>
       <ul ref="legend" className="collapsible" data-collapsible="accordion" 
       style={{zIndex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left',  margin: 0, maxHeight: '100%', boxShadow: 'none', border: 'none'}}>
        <li className="z-depth-1" 
          style={{zIndex: 1, display: 'flex', flexDirection: 'column', 
                  backgroundColor: '#FFF', maxHeight: '100%', 
                  borderTop: '1px solid #ddd',
                  borderRight: '1px solid #ddd',
                  borderLeft: '1px solid #ddd'}}>
          <div className="collapsible-header active no-padding" style={{height: '32px', minHeight: '32px'}} onClick={this.toggleCollapsed.bind(this)}>
            {title}
          </div>
          <div className="collapsible-body" style={{display: 'flex', flexDirection: 'column', borderBottom: 'none'}}>
            <div className="no-margin"  style={{overflowY: allowScroll ? 'auto': 'hidden', padding: '5px'}}>
              {
                this.props.layers.map(function (layer) {
                  if(typeof layer.settings.active === 'undefined'){
                    layer.settings.active = true;
                  }
                  if(_this.props.hideInactive && !layer.settings.active){
                    return null;
                  }
                  return (<LegendItem key={layer.layer_id} layer={layer} />);
                })
              }
 
            <div style={{lineHeight: '0.75em', padding: '2px'}}>
              <span style={{fontSize: '6px', float: 'left', backgroundColor: '#FFF'}} 
              className="grey-text align-left">Base Map - <span className="no-margin no-padding" dangerouslySetInnerHTML={{__html: this.state.attribution}}></span></span>
            </div>           
            </div>
          </div>
          </li>
        </ul>
      </div>
    );
  }
}
