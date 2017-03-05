var React = require('react');

var LayerList = require('./LayerList');

var $ = require('jquery');
//var _isEmpty = require('lodash.isempty');
var _isEqual = require('lodash.isequal');
var _debounce = require('lodash.debounce');
var Map = require('../Map/Map');

var MiniLegend = require('../Map/MiniLegend');

var AddLayerPanel = require('./AddLayerPanel');
var SaveMapPanel = require('./SaveMapPanel');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var MapMakerStore = require('../../stores/MapMakerStore');
var UserStore = require('../../stores/UserStore');
var Actions = require('../../actions/MapMakerActions');
var DataEditorActions = require('../../actions/DataEditorActions');
var ConfirmationActions = require('../../actions/ConfirmationActions');
var NotificationActions = require('../../actions/NotificationActions');
var MessageActions = require('../../actions/MessageActions');
var EditLayerPanel = require('./EditLayerPanel');
var MapLayerDesigner = require('../LayerDesigner/MapLayerDesigner');
var EditorToolButtons = require('./EditorToolButtons');

var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');


var MapMaker = React.createClass({

  mixins:[StateMixin.connect(MapMakerStore), StateMixin.connect(UserStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    edit: React.PropTypes.bool,
    mapLayers: React.PropTypes.array,
    showVisibility: React.PropTypes.bool,
    onCreate: React.PropTypes.func,
    onClose: React.PropTypes.func,
    myLayers: React.PropTypes.array,
    popularLayers: React.PropTypes.array,
    myGroups: React.PropTypes.array,
    title: React.PropTypes.string,
    position: React.PropTypes.object,
    basemap: React.PropTypes.string,
    map_id: React.PropTypes.number,
    owned_by_group_id: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      edit: false,
      popularLayers: [],
      showVisibility: true,
      mapLayers: null,
      showTitleEdit: true,
      map_id: null,
      owned_by_group_id: null,
      title: null,
      basemap: null
    };
  },

  getInitialState(){
    return {
      showMapLayerDesigner: false,
      canSave: false
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

    if(this.props.map_id){
      Actions.setMapId(this.props.map_id);
    }

     if(this.props.owned_by_group_id){
      Actions.setOwnedByGroupId(this.props.owned_by_group_id);
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
      var debounced = _debounce(function(){
        var size = getSize();
        _this.setState({
          width: size.width,
          height: size.height
        });
      }, 2500).bind(this);
      debounced();
    });

  },

  componentDidMount(){
    var _this = this;
    $('ul.tabs').tabs();
    $(this.refs.mapMakerToolPanel).collapsible();
    if(this.props.edit){
      this.toggleMapTab();
    }

    window.onbeforeunload = function(){
      if(!_this.state.saved && _this.state.mapLayers.length > 0){
        return _this.__('Please save your map to avoid losing your work!');
      }
    };
  },

  componentWillReceiveProps(nextProps){

    if(!_isEqual(nextProps.position, this.props.position)){
      Actions.setMapPosition(nextProps.position);
    }
  },

  componentDidUpdate(prevProps, prevState){
    $('.layer-card-tooltipped').tooltip();
    $('.savebutton-tooltipped').tooltip();

    if(this.state.editingLayer && !prevState.editingLayer){
      if(this.refs.editLayerPanel){
        $(this.refs.layersListPanel).removeClass('active');
        $(this.refs.layersListPanel).find('.collapsible-body').css('display', 'none');

        $(this.refs.saveMapPanel).removeClass('active');
        $(this.refs.saveMapPanel).find('.collapsible-body').css('display', 'none');

        $(this.refs.editLayerPanel).addClass('active');
        $(this.refs.editLayerPanel).find('.collapsible-body').css('display', 'block');
        
      }
    }
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
    this.setState({saved: true});
    if(this.props.onCreate) this.props.onCreate(this.state.map_id, this.state.title);
  },


   privacyCheck(isPrivate, group_id){
    //check if layers meet privacy rules, before sending a request to the server that will fail...
    if(isPrivate){
      if(!group_id){
         return this.__('Private map must be saved to a group');
      }
      //check all layers are in the same group
      var privateLayerInOtherGroup = false;
      this.state.mapLayers.forEach(function(layer){
        if(layer.private && layer.owned_by_group_id !== group_id){
          privateLayerInOtherGroup = true;
        }
      });
      if(privateLayerInOtherGroup){
        return this.__('Private layers must belong to the same group that owns the map. Change the group where you are saving the map or remove the private layer.');
      }

    }else{
      //check that no private layers are included
      var privateLayerInPublicMap = false;
      this.state.mapLayers.forEach(function(layer){
        if(layer.private){
          privateLayerInPublicMap = true;
        }
      });
      if(privateLayerInPublicMap){
        return this.__('A public map cannot contain private layers. Please save as a private map owned by your group, or remove the private layer');
      }
    }

  },


  onSave(model, cb){
    
    var _this = this;

    var position = this.refs.map.getPosition();
    position.bbox = this.refs.map.getBounds();

    if(model.private === undefined) model.private = false;

    var err = this.privacyCheck(model.private, model.group);
    if(err){
       MessageActions.showMessage({title: _this.__('Error'), message: err});
    }else{

      var basemap = this.refs.map.getBaseMap();
      if(!this.state.map_id || this.state.map_id == -1){
        Actions.createMap(model.title, position, basemap, model.group, model.private, _this.state._csrf, err =>{
          cb();
          if(err){
            //display error to user
            MessageActions.showMessage({title: _this.__('Error'), message: err});
          }else{
            //hide designer
            NotificationActions.showNotification({message: _this.__('Map Saved')});
            _this.onCreate();
          }
        });
      }else{
        Actions.saveMap(model.title, position, basemap, this.state._csrf, err =>{
          cb();
          if(err){
            //display error to user
            MessageActions.showMessage({title: _this.__('Error'), message: err});
          }else{
            //hide designer
            NotificationActions.showNotification({message: _this.__('Map Saved')});
            _this.onCreate();
          }
        });
      }
    }
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

  onLayerStyleChange(layer_id, style, labels, legend, settings){
    var _this = this;
    Actions.updateLayerStyle(layer_id, style, labels, legend, settings, function(){
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

  addLayer(layer){
    var _this=this;
    $('.layer-card-tooltipped').tooltip('remove');

    if(this.state.mapLayers.length == 0){
      _this.refs.map.fitBounds(layer.extent_bbox, 16, 25, false);
    }

    var position = this.refs.map.getPosition();
    position.bounds = this.refs.map.getBounds();

    Actions.setMapPosition(position);
    Actions.addToMap(layer, function(err){
      if(err){
        NotificationActions.showNotification({message: this.__('Map already contains this layer'), dismissAfter: 3000, position: 'topright'});
      }
      //reset stuck tooltips...
      $('.layer-card-tooltipped').tooltip();

      //switch to map tab
      _this.toggleMapTab();
    });
  },

  toggleMapTab(){
    $(this.refs.tabs).tabs('select_tab', 'maptab');
    var evt = document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false, window, 0);
    window.dispatchEvent(evt);

  },

  toggleAddLayerTab(){
    $(this.refs.tabs).tabs('select_tab', 'addlayer');
    var evt = document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false, window, 0);
    window.dispatchEvent(evt);

  },

  editLayer(layer){
    Actions.startEditing();
    DataEditorActions.startEditing(layer);
    this.refs.map.startEditingTool(layer);
  },

  saveEdits(){
    DataEditorActions.saveEdits(this.state._csrf, function(){
      this.refs.map.stopEditingTool();
      //TODO: notify user
    });
  },

  stopEditingLayer(){
    //TODO: warn user if there are unsaved edits
  Actions.stopEditing();
    DataEditorActions.stopEditing();
    this.refs.map.stopEditingTool();
  },

  render(){
    var _this = this;
    var panelHeight = this.state.height - 155;

    var tabContentDisplay = 'none';
    if (typeof window !== 'undefined') {
      tabContentDisplay = 'inherit';
    }

    
    var overlayLayerList = '';
    if(this.state.showMapLayerDesigner){
      overlayLayerList = (
        <MapLayerDesigner ref="LayerDesigner"
          layer={this.state.layerDesignerLayer}
          onStyleChange={this.onLayerStyleChange}
          onClose={this.closeLayerDesigner} />
      );
    }else if (!this.state.mapLayers || this.state.mapLayers.length == 0) {
      overlayLayerList = (
        <div style={{height: '100%', padding: 0, margin: 0}}>
          <p>{this.__('No layers in map, use the tab to the right to add an overlay layer.')}</p>
        </div>
      );
    }else{
      overlayLayerList = (
        <LayerList 
          layers={this.state.mapLayers}
          showVisibility={_this.props.showVisibility}
          showRemove={true} showDesign={true} showEdit={!this.state.editingLayer}
          toggleVisibility={_this.toggleVisibility}
          removeFromMap={_this.removeFromMap}
          showLayerDesigner={_this.showLayerDesigner}
          updateLayers={Actions.setMapLayers}
          editLayer={_this.editLayer}
          />
      );
    }

    var editLayerPanel='', editingTools = '';
    if(this.state.editingLayer){
      panelHeight = this.state.height - 186;
      editLayerPanel = (
        <li ref="editLayerPanel">
              <div className="collapsible-header"><i className="material-icons">edit</i>{this.__('Editing Layer')}</div>
              <div className="collapsible-body" >
                <div style={{height: panelHeight.toString() + 'px', overflow: 'auto'}}>
                  <EditLayerPanel />
                </div>

              </div>
            </li>
      );

      editingTools= (
        <EditorToolButtons stopEditingLayer={this.stopEditingLayer} />     
      );
     
    }

    var mapExtent = null;
    if(this.state.position && this.state.position.bbox){
      var bbox = this.state.position.bbox;
      mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]];
    }

    return (
      <div className="row no-margin" style={{width: '100%', height: '100%'}}>
        <div className="create-map-side-nav col s6 m4 l3 no-padding" style={{height: '100%'}}>
          <ul ref="mapMakerToolPanel" className="collapsible no-margin" data-collapsible="accordion" style={{height: '100%', borderTop: 'none'}}>
            {editLayerPanel}
            <li ref="layersListPanel">
              <div className="collapsible-header active"><i className="material-icons">layers</i>{this.__('Overlay Layers')}</div>
              <div className="collapsible-body" >
                <div style={{height: panelHeight.toString() + 'px', overflow: 'auto'}}>
                  {overlayLayerList}
                </div>

              </div>
            </li>
            <li  ref="saveMapPanel">
              <div className="collapsible-header"><i className="material-icons">save</i>{this.__('Save')}</div>
              <div className="collapsible-body">
                <div style={{height: panelHeight.toString() + 'px', overflow: 'auto'}}>
                  <SaveMapPanel groups={this.props.myGroups} onSave={this.onSave} />
                </div>
                
              </div>
            </li>
        </ul>
        </div>
        <div className="col s6 m8 l9 no-padding" style={{height: '100%'}}>
          <ul className="tabs" ref="tabs" style={{overflowX: 'hidden'}}>
            <li className="tab mapmaker-tab"><a className="active" href="#addlayer" onClick={this.toggleAddLayerTab}>{this.__('Add a Layer')}</a></li>
            <li className="tab mapmaker-tab"><a href="#maptab" onClick={this.toggleMapTab}>{this.__('View Map')}</a></li>
          </ul>

            <div id="addlayer" style={{height: 'calc(100% - 42px)', overflow: 'scroll', display: tabContentDisplay}}>
              <AddLayerPanel myLayers={this.props.myLayers}
                popularLayers={this.props.popularLayers}
                onAdd={this.addLayer} />
            </div>
            <div id="maptab" className="row no-margin" style={{height: 'calc(100% - 30px)', display: tabContentDisplay}}>
              <div className="row" style={{height: '100%', width: '100%', margin: 0, position: 'relative'}}>
                <Map ref="map" id="create-map-map" style={{height: '100%', width: '100%', margin: 'auto'}}
                  glStyle={this.state.mapStyle}
                  baseMap={this.state.basemap}
                  insetMap={false}
                  onChangeBaseMap={Actions.setMapBasemap}
                  fitBounds={mapExtent}
                  hash={true}
                  >
                  {editingTools}
                  </Map>

                  <MiniLegend style={{
                        position: 'absolute',
                        top: '5px',
                        left: '5px',
                        minWidth: '200px',
                        zIndex: '1',
                        width: '25%'
                      }} layers={this.state.mapLayers} collapseToBottom={false} hideInactive={true} />
              </div>
            </div>
        </div>
      </div>
    );
  }
});

module.exports = MapMaker;
