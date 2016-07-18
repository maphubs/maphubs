var React = require('react');

var GroupTag = require('../Groups/GroupTag');

var $ = require('jquery');
var _isEmpty = require('lodash.isempty');
var _isEqual = require('lodash.isequal');
var slug = require('slug');
var Map = require('../Map/Map');

var MiniLegend = require('../Map/MiniLegend');

var AddLayerPanel = require('./AddLayerPanel');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var MapMakerStore = require('../../stores/MapMakerStore');
var Actions = require('../../actions/MapMakerActions');
var ConfirmationActions = require('../../actions/ConfirmationActions');
var NotificationActions = require('../../actions/NotificationActions');
var MessageActions = require('../../actions/MessageActions');

var MapLayerDesigner = require('../LayerDesigner/MapLayerDesigner');

import Editor from 'react-medium-editor';

var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');


var MapMaker = React.createClass({

  mixins:[StateMixin.connect(MapMakerStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    mapLayers: React.PropTypes.array,
    showVisibility: React.PropTypes.bool,
    onCreate: React.PropTypes.func,
    onClose: React.PropTypes.func,
    myLayers: React.PropTypes.array,
    popularLayers: React.PropTypes.array,
    title: React.PropTypes.string,
    position: React.PropTypes.object,
    basemap: React.PropTypes.string,
    mapId: React.PropTypes.number
  },

  getDefaultProps() {
    return {
      popularLayers: [],
      showVisibility: true,
      mapLayers: null,
      showTitleEdit: true,
      mapId: null,
      title: null,
      basemap: null
    };
  },

  getInitialState(){
    return {
      showMapLayerDesigner: false
    };
  },

  componentWillMount(){
    var _this = this;

    if(this.props.mapLayers){
      Actions.setMapLayers(this.props.mapLayers);
    }

    if(this.props.title){
      Actions.setMapTitle(this.props.title);
    }

    if(this.props.position){
      Actions.setMapPosition(this.props.position);
    }

    if(this.props.basemap){
      Actions.setMapBasemap(this.props.basemap);
    }

    if(this.props.mapId){
      Actions.setMapId(this.props.mapId);
    }

    if (typeof window === 'undefined') return; //only run this on the client
    function isRetinaDisplay() {
        if (window.matchMedia) {
            var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
            return (mq && mq.matches || (window.devicePixelRatio > 1));
        }
    }
    //detect retina
    var retina = false;
    if (isRetinaDisplay()){
      retina = true;
    }

    function getSize(){
      // Get the dimensions of the viewport
      var width = Math.floor($(window).width());
      var height = $(window).height();
      return {width, height};
    }

    var size = getSize();
    this.setState({
      retina,
      width: size.width,
      height: size.height
    });

    $(window).resize(function(){
      var size = getSize();
      _this.setState({
        width: size.width,
        height: size.height
      });
    });

  },

  componentDidMount(){
    $('ul.tabs').tabs();
    $('.collapsible').collapsible();
    this.resetSearch();
    $(this.refs.sidenav).sideNav({
      menuWidth: 300, // Default is 240
      edge: 'left', // Choose the horizontal origin
      closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
    }
    );
  },

  componentWillReceiveProps(nextProps){

    if(!_isEqual(nextProps.position, this.props.position)){
      Actions.setMapPosition(nextProps.position);
    }
  },

  componentDidUpdate(){
    $('.layer-card-tooltipped').tooltip();
    $('.savebutton-tooltipped').tooltip();

  },

  onClose(){
    $('.savebutton-tooltipped').tooltip('remove');
    if(this.props.onClose) this.props.onClose();
    Actions.closeMapDesigner();
  },

  onCancel(){
    $('.savebutton-tooltipped').tooltip('remove');
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Cancel'),
      postitiveButtonText: _this.__('Cancel Map'),
      negativeButtonText: _this.__('Return to Editing Map'),
      message: _this.__('Your map has not been saved, please confirm that you want to cancel your map.'),
      onPositiveResponse(){
        _this.onClose();
      }
    });
  },

  onCreate(){
    if(this.props.onCreate) this.props.onCreate(this.state.map_id, this.state.title);
  },


  onSave(){
    $('.savebutton-tooltipped').tooltip('remove');
    var _this = this;

    if(!this.state.title || this.state.title == ''){
      NotificationActions.showNotification({message: this.__('Please Add a Title'), dismissAfter: 5000, position: 'bottomleft'});
      return;
    }

    var position = this.refs.map.getPosition();
    position.bbox = this.refs.map.getBounds();

    var basemap = this.refs.map.getBaseMap();
    if(!this.state.map_id || this.state.map_id == -1){
      Actions.createUserMap(position, basemap, function(err){
        if(err){
          //display error to user
          MessageActions.showMessage({title: _this.__('Error'), message: err});
        }else{
          //hide designer
          Actions.closeMapDesigner();
          NotificationActions.showNotification({message: _this.__('Map Saved')});
          _this.onCreate();
        }
      });
    }else{
      Actions.saveMap(position, basemap, function(err){
        if(err){
          //display error to user
          MessageActions.showMessage({title: _this.__('Error'), message: err});
        }else{
          //hide designer
          Actions.closeMapDesigner();
          NotificationActions.showNotification({message: _this.__('Map Saved')});
          _this.onCreate();
        }
      });
    }
  },

  handleTitleChange(title){
    Actions.setMapTitle(title);
  },

  toggleVisibility(layer_id){
    $('.layer-card-tooltipped').tooltip('remove');
    Actions.toggleVisibility(layer_id, function(){
    });
    $('.layer-card-tooltipped').tooltip();
  },

  showLayerDesigner(layer){
    $('.layer-card-tooltipped').tooltip('remove');
    this.setState({showMapLayerDesigner: true, layerDesignerLayer: layer});
    $('.layer-card-tooltipped').tooltip();
  },

  onLayerStyleChange(layer_id, style, labels, legend){
    var _this = this;
    Actions.updateLayerStyle(layer_id, style, labels, legend, function(){
      _this.refs.map.reload(null, _this.state.mapStyle);
    });
  },

  closeLayerDesigner(){
    this.setState({showMapLayerDesigner: false});
  },

  removeFromMap(layer){
    $('.layer-card-tooltipped').tooltip('remove');
    Actions.removeFromMap(layer);
    $('.layer-card-tooltipped').tooltip();
  },
  moveUp(layer){
    $('.layer-card-tooltipped').tooltip('remove');
    Actions.moveUp(layer);
    $('.layer-card-tooltipped').tooltip();
  },
  moveDown(layer){
    $('.layer-card-tooltipped').tooltip('remove');
    Actions.moveDown(layer);
    $('.layer-card-tooltipped').tooltip();
  },

  addLayer(layer){
    $('.layer-card-tooltipped').tooltip('remove');
    //save map position so adding a layer doesn't reset it
    var position = this.refs.map.getPosition();
    position.bounds = this.refs.map.getBounds();
    Actions.setMapPosition(position);
    Actions.addToMap(layer, function(err){
      if(err){
        NotificationActions.showNotification({message: this.__('Map already contains this layer'), dismissAfter: 3000, position: 'bottomleft'});
      }
      //reset stuck tooltips...
      $('.layer-card-tooltipped').tooltip();
    });
  },

  toggleAddLayer(){

  },

  render(){
    var _this = this;

    var tabContentDisplay = 'none';
    if (typeof window !== 'undefined') {
      tabContentDisplay = 'inherit';
    }

    var title = '';
    var placeholder = null;
    if(_isEmpty(this.state.title)){
      placeholder = {text: this.__('Enter a Map Title')};
    }
    var classNames = "create-map-title right grey-text text-darken-4";
    if(this.state.title && this.state.title != ''){
      classNames = classNames + " hide-placeholder";
    }
    title = (
      <div className={classNames} style={{marginRight: '20px', textAlign: 'right'}}>
        <Editor
       tag="p"
       text={this.state.title}
       onChange={this.handleTitleChange}
       options={{
         buttonLabels: 'false',
         placeholder,
         disableReturn: true,
         toolbar: {
           buttons: []
         }
       }}
     />
    </div>
    );


    var sidebarContent = '';
    if(this.state.showMapLayerDesigner){
      sidebarContent = (
        <MapLayerDesigner ref="LayerDesigner" layer={this.state.layerDesignerLayer} onStyleChange={this.onLayerStyleChange} onClose={this.closeLayerDesigner} />
      );
    }else if (!this.state.mapLayers || this.state.mapLayers.length == 0) {
      sidebarContent = (
        <div style={{height: '100%', padding: 0, margin: 0}}>
          <p>{this.__('No Layers in Map')}</p>
          <button className="btn" onClick={this.toggleAddLayer()}>{this.__('Add a Layer')}</button>
        </div>
      );
    }else{
      sidebarContent = (
        <div style={{height: '100%', padding: 0, margin: 0}}>
          <ul ref="layers" style={{height: '100%', overflow: 'auto'}} className="collection no-margin custom-scroll-bar">{
            this.state.mapLayers.map(function (layer) {
                var visibilityButton = '';
                if(_this.props.showVisibility){
                  var icon = 'visibility';
                  if(!layer.active) icon = 'visibility_off';
                    visibilityButton = (
                      <a onClick={function(){_this.toggleVisibility(layer.layer_id);}}
                        className="create-map-btn layer-card-tooltipped"
                        data-position="top" data-delay="50" data-tooltip={_this.__('Show/Hide Layer')}>
                        <i className="material-icons omh-accent-text">{icon}</i>
                      </a>
                    );
                }
                return (
                  <li key={layer.layer_id} className="collection-item"
                    style={{height: '70px', paddingRight: '5px', paddingLeft: '5px', paddingTop: '0px', paddingBottom: '0px', overflow: 'hidden', border: '1px solid #ddd'}}>
                    <div className="title col s8">
                      <b className="title truncate grey-text text-darken-4 layer-card-tooltipped"
                        style={{fontSize: '12px'}}
                        data-position="top" data-tooltip={layer.name}>
                        {layer.name}
                      </b>
                      <GroupTag group={layer.owned_by_group_id} />
                      <p className="truncate no-margin grey-text text-darken-1" style={{fontSize: '8px', lineHeight: '10px'}}>{layer.source}</p>
                    </div>
                      <div className="secondary-content col s4 no-padding">

                        <div className="col s4 no-padding">
                          <a href={'/layer/info/'+ layer.layer_id + '/' + slug(layer.name ? layer.name : '')} target="_blank"
                            className="create-map-btn layer-card-tooltipped"
                            data-position="top" data-delay="50" data-tooltip={_this.__('Layer Info')}>
                            <i className="material-icons omh-accent-text">info</i>
                            </a>
                        </div>
                        <div className="col s4 no-padding">
                         {visibilityButton}
                        </div>
                        <div className="col s4 no-padding">
                        <div className="fixed-action-btn horizontal"
                          style={{
                            position: 'relative',
                            right: 0,
                            paddingLeft: '5px',
                            bottom: 0,
                            height: '70px'}}>
                           <a className="create-map-btn">
                             <i className="material-icons omh-accent-text">more_horiz</i>
                           </a>
                           <ul style={{
                               height: '40px',
                               bottom: '0px',
                              right: '50%',
                              width: '215px'
                            }}>
                             <li className="create-map-popup-btn no-padding"><a onClick={function(){_this.removeFromMap(layer);}} className="btn-floating red layer-card-tooltipped" data-position="top" data-delay="50" data-tooltip={_this.__('Remove from Map')}><i className="material-icons">remove</i></a></li>
                             <li className="create-map-popup-btn no-padding"><a onClick={function(){_this.showLayerDesigner(layer);}} className="btn-floating amber darken-4 layer-card-tooltipped" data-position="top" data-delay="50" data-tooltip={_this.__('Edit Layer Style')}><i className="material-icons">color_lens</i></a></li>
                             <li className="create-map-popup-btn no-padding"><a onClick={function(){_this.moveUp(layer);}} className="btn-floating omh-color layer-card-tooltipped" data-position="top" data-delay="50" data-tooltip={_this.__('Move Up')}><i className="material-icons">keyboard_arrow_up</i></a></li>
                             <li className="create-map-popup-btn no-padding"><a onClick={function(){_this.moveDown(layer);}} className="btn-floating omh-color layer-card-tooltipped" data-position="top" data-delay="50" data-tooltip={_this.__('Move Down')}><i className="material-icons">keyboard_arrow_down</i></a></li>
                           </ul>
                         </div>
                       </div>
                      </div>
                  </li>);
            })
          }</ul>
        </div>
      );
    }

    var mapExtent = null;
    if(this.state.position && this.state.position.bbox){
      var bbox = this.state.position.bbox;
      mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]];
    }

    var panelHeight = this.state.height - 155;

    return (
      <div className="row no-margin" style={{width: '100%', height: '100%'}}>
        <div className="create-map-side-nav col s6 m4 l3 no-padding" style={{height: '100%'}}>
          <ul className="collapsible no-margin" data-collapsible="accordion" style={{height: '100%'}}>
            <li>
              <div className="collapsible-header active"><i className="material-icons">layers</i>{this.__('Step 1: Map Layers')}</div>
              <div className="collapsible-body" >
                <div style={{height: panelHeight.toString() + 'px', overflow: 'auto'}}>
                  {sidebarContent}
                </div>

              </div>
            </li>
            <li>
              <div className="collapsible-header"><i className="material-icons">share</i>{this.__('Step 2: Save & Share')}</div>
              <div className="collapsible-body">
                  {title}
              </div>
            </li>
        </ul>
        </div>
        <div className="col s6 m10 l9 no-padding" style={{height: '100%'}}>
          <ul className="tabs" style={{overflowX: 'hidden'}}>
            <li className="tab mapmaker-tab"><a href="#maptab">{this.__('View Map')}</a></li>
            <li className="tab mapmaker-tab"><a className="active" href="#addlayer">{this.__('Add a Layer')}</a></li>
          </ul>
            <div id="maptab" className="row no-margin" style={{height: 'calc(100% - 50px)', display: tabContentDisplay}}>
              <div className="row" style={{height: '100%', width: '100%', margin: 0, position: 'relative'}}>
                <Map ref="map" id="create-map-map" style={{height: '100%', width: '100%', margin: 'auto'}}
                  glStyle={this.state.mapStyle}
                  baseMap={this.state.basemap}
                  onChangeBaseMap={Actions.setMapBasemap}
                  fitBounds={mapExtent}
                  />

                  <MiniLegend style={{
                        position: 'absolute',
                        top: '5px',
                        left: '5px',
                        minWidth: '200px',
                        zIndex: '1',
                        width: '25%'
                      }} layers={this.state.mapLayers} hideInactive={false} />
              </div>
            </div>
            <div id="addlayer" style={{height: '100%', display: tabContentDisplay}}>
              <AddLayerPanel myLayers={this.props.myLayers}
                popularLayers={this.props.popularLayers}
                onAdd={this.addLayer} />
            </div>
        <div className="fixed-action-btn action-button-bottom-right savebutton-tooltipped" data-position="top" data-delay="50" data-tooltip={_this.__('Save Map')}>
          <a onClick={this.onSave} className="btn-floating btn-large blue">
            <i className="large material-icons">save</i>
          </a>
        </div>
        <div className="fixed-action-btn action-button-bottom-right savebutton-tooltipped"
          style={{right: '85px'}}
          data-position="top" data-delay="50" data-tooltip={_this.__('Cancel Map')}>
          <a onClick={this.onCancel} className="btn-floating btn-large red">
            <i className="large material-icons">close</i>
          </a>
        </div>
        </div>
      </div>
    );
  }
});

module.exports = MapMaker;
