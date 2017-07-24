//@flow
import React from 'react';
var $ = require('jquery');
import BaseMapStore from '../../stores/map/BaseMapStore';
import LegendItem from './LegendItem';
import MapHubsComponent from '../MapHubsComponent';
var MapStyles = require('./Styles');
import type {BaseMapStoreState} from '../../stores/map/BaseMapStore';

type Props = {|
  title?: LocalizedString,
  layers: Array<Object>,
  hideInactive: boolean,
  collapsible: boolean,
  collapseToBottom: boolean,
  showLayersButton: boolean,
  mapLayersActivatesID?: string,
  maxHeight: string,
  style: Object
|}

type DefaultProps = {
  layers: Array<Object>,
  hideInactive: boolean,
  collapsible: boolean,
  collapseToBottom: boolean,
  showLayersButton: boolean,
  maxHeight: string,
  style: Object
}

type State = {|
  collapsed: boolean
|} & BaseMapStoreState

export default class MiniLegend extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    layers: [],
    hideInactive: true,
    collapsible: true,
    collapseToBottom: false,
    showLayersButton: true,
    maxHeight: '100%',
    style: {}
  }

  state: State = {
    collapsed: false
  }

  constructor(props: Props){
		super(props);
    this.stores.push(BaseMapStore);
	}

  componentDidMount() {
    if(this.props.collapsible){
       $(this.refs.legend).collapsible();
    }
   
    if(this.props.showLayersButton){
      $(this.refs.mapLayersButton).sideNav({
        menuWidth: 260, // Default is 240
        edge: 'left', // Choose the horizontal origin
        closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
      });
    }
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: this.state.collapsed ? false : true
    });
  }

  render(){
    var _this = this;

    var layersButton = '';
    if(this.props.showLayersButton){
      layersButton = (
         <a ref="mapLayersButton"
                href="#" 
                data-activates={this.props.mapLayersActivatesID}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '0px',
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
    let titleFontSize = '15px';
    if(this.props.title){
      titleText = this._o_(this.props.title);
      if(titleText){
        if(titleText.length > 80) {
          titleFontSize = '8px';
        }else if(titleText.length > 60) {
          titleFontSize = '11px';
        }
        
      }else{
        // if localized text is empty
        titleText = this.__('Legend');
      }
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
            <h6 className="black-text valign word-wrap" style={{
              padding: '0.2rem', marginLeft: '2px', marginTop: '0px', marginBottom: '2px', 
              fontWeight: '500',
              fontSize: titleFontSize
              }}>{titleText}</h6>
          </div>
          <div className="col s2 no-padding valign">
            {layersButton}
            <i ref="titleIcon" className="material-icons icon-fade-in" style={{float: 'right', marginRight: 0, height: '100%', lineHeight: '32px'}}>{iconName}</i>
          </div>
        </div>
      );
    }else{
      title = (
        <div className="row no-margin valign-wrapper" style={{height: '32px'}}>
          <h6 className="black-text valign" style={{
            padding: '0.2rem',  marginLeft: '2px', 
            fontWeight: '500',
            fontSize: titleFontSize
            }}>{titleText}</h6>
          <div className="col s2 no-padding valign">
            {layersButton}
          </div>
        </div>
      );
    }

     var allowScroll = true;
    if(this.state.collapsed || this.props.layers.length === 1){
      allowScroll = false;
    }

    let contentHeight = `calc(${this.props.maxHeight} - 32px)`;
    let legendHeight = this.props.maxHeight;
    if(this.state.collapsed){
      contentHeight = '0px';
      legendHeight = '0px';
    }

    //var style = this.props.style;
    //style.height = '9999px'; //needed for the flex box to work correctly

    return (
      <div style={this.props.style}>
       <ul ref="legend" className="collapsible" data-collapsible="accordion" 
       style={{
         zIndex: 1, 
         textAlign: 'left',  
         margin: 0, 
         position: 'absolute',
         height: legendHeight, 
         width: '100%',
         boxShadow: 'none', 
         pointerEvents: 'none',
         border: 'none'}}>
        <li className="z-depth-1" 
          style={{
                  backgroundColor: '#FFF', height: 'auto', 
                  pointerEvents: 'auto',
                  borderTop: '1px solid #ddd',
                  borderRight: '1px solid #ddd',
                  borderLeft: '1px solid #ddd'}}>
          <div className="collapsible-header active no-padding" style={{height: '32px', minHeight: '32px'}} onClick={this.toggleCollapsed}>
            {title}
          </div>
          <div className="collapsible-body" 
            style={{
              display: 'flex', flexDirection: 'column', 
              borderBottom: 'none'}}>
            <div className="no-margin"  
              style={{
                overflowX: 'hidden', 
                overflowY: allowScroll ? 'auto': 'hidden', 
                maxHeight: contentHeight,
                padding: '5px'}}>
              {
                this.props.layers.map((layer) => {
                  let active = MapStyles.settings.get(layer.style, 'active');
                  if(typeof active === 'undefined'){
                    layer.style = MapStyles.settings.set(layer.style, 'active', true);
                    active = true;
                  }
                  if(_this.props.hideInactive && !active){
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
