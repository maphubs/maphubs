//@flow
import React from 'react';

var $ = require('jquery');
import LayerList from './LayerList';
import _isEqual from 'lodash.isequal';
import _debounce from 'lodash.debounce';
import _find from 'lodash.find';
import Map from '../Map/Map';
import MiniLegend from '../Map/MiniLegend';
import AddLayerPanel from './AddLayerPanel';
import SaveMapPanel from './SaveMapPanel';
import MapMakerStore from '../../stores/MapMakerStore';
import UserStore from '../../stores/UserStore';
import Actions from '../../actions/MapMakerActions';
import DataEditorActions from '../../actions/DataEditorActions';
import ConfirmationActions from '../../actions/ConfirmationActions';
import NotificationActions from '../../actions/NotificationActions';
import MessageActions from '../../actions/MessageActions';
import EditLayerPanel from './EditLayerPanel';
import MapLayerDesigner from '../LayerDesigner/MapLayerDesigner';
import EditorToolButtons from './EditorToolButtons';
import ForestLossLegendHelper from '../Map/ForestLossLegendHelper';
import MapHubsComponent from '../MapHubsComponent';
import Reflux from '../Rehydrate';
import fireResizeEvent from '../../services/fire-resize-event';
import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {UserStoreState} from '../../stores/UserStore';
import type {MapMakerStoreState} from '../../stores/MapMakerStore';
import type {Layer} from '../../stores/layer-store';

type Props =  {
    edit: boolean,
    mapLayers: Array<Layer>,
    showVisibility:  boolean,
    onCreate: Function,
    onClose: Function,
    myLayers: Array<Layer>,
    popularLayers: Array<Layer>,
    myGroups: Array<Object>,
    title?: string,
    position: Object,
    basemap?: string,
    map_id: number,
    owned_by_group_id?: string,
    editLayer?: Layer,
    mapConfig: Object
  }

  type DefaultProps = {
    edit: boolean,
    popularLayers:  Array<Layer>,
    showVisibility: boolean,
    mapLayers: null,
    showTitleEdit: boolean,
    map_id: ?number,
    owned_by_group_id: ?string,
    title: ?string,
    basemap: ?string,
    editLayer: ?Layer
  }

  type State = {
    showMapLayerDesigner: boolean,
    canSave: boolean,
    editLayerLoaded: boolean
  } & LocaleStoreState & MapMakerStoreState & UserStoreState

export default class MapMaker extends MapHubsComponent<DefaultProps, Props, State> {

  props:  Props


  static defaultProps: DefaultProps = {
    edit: false,
    popularLayers: [],
    showVisibility: true,
    mapLayers: null,
    showTitleEdit: true,
    map_id: null,
    owned_by_group_id: null,
    title: null,
    basemap: null,
    editLayer: null
  }

  state: State = {
    showMapLayerDesigner: false,
    canSave: false,
    editLayerLoaded: false
  }

  constructor(props: Props){
    super(props);
    this.stores.push(MapMakerStore);
    this.stores.push(UserStore);
    Reflux.rehydrate(MapMakerStore, {position:this.props.position, title:this.props.title, map_id:this.props.map_id, owned_by_group_id:this.props.owned_by_group_id});
    
  }

  componentWillMount(){
    super.componentWillMount();
    var _this = this;
    if(this.props.mapLayers){
      Actions.setMapLayers(this.props.mapLayers);
    }

    if(this.props.basemap){
      Actions.setMapBasemap(this.props.basemap);
    }
 /*
    if(this.props.position){
      Actions.setMapPosition(this.props.position);
    }

    

    

    if(this.props.title){
      Actions.setMapTitle(this.props.title);
    }

    if(this.props.map_id){
      Actions.setMapId(this.props.map_id);
    }

     if(this.props.owned_by_group_id){
      Actions.setOwnedByGroupId(this.props.owned_by_group_id);
    }
    */

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
      var debounced = _debounce(() => {
        var size = getSize();
        _this.setState({
          width: size.width,
          height: size.height
        });
      }, 2500).bind(this);
      debounced();
    });
  }

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
  }

  componentWillReceiveProps(nextProps: Object){

    if(!_isEqual(nextProps.position, this.props.position)){
      Actions.setMapPosition(nextProps.position);
    }
  }

  componentDidUpdate(prevProps: Object, prevState: Object){
    $('.layer-card-tooltipped').tooltip();
    $('.savebutton-tooltipped').tooltip();

    if(this.state.editingLayer && !prevState.editingLayer){
      //starting editing
      if(this.refs.editLayerPanel){
        $(this.refs.layersListPanel).removeClass('active');
        $(this.refs.layersListPanel).find('.collapsible-body').css('display', 'none');

        $(this.refs.saveMapPanel).removeClass('active');
        $(this.refs.saveMapPanel).find('.collapsible-body').css('display', 'none');

        $(this.refs.editLayerPanel).addClass('active');
        $(this.refs.editLayerPanel).find('.collapsible-body').css('display', 'block');
        
      }
    }else if(!this.state.editingLayer && prevState.editingLayer){
      //stopping editing
      $(this.refs.layersListPanel).addClass('active');
      $(this.refs.layersListPanel).find('.collapsible-body').css('display', 'block');
    }

    if(!this.state.editLayerLoaded && this.props.editLayer && this.refs.map && this.refs.map.map){
     this.addLayer(this.props.editLayer);
     this.editLayer(this.props.editLayer);
     this.setState({editLayerLoaded: true});
    }
  }

  onClose = () => {
    $('.savebutton-tooltipped').tooltip('remove');
    if(this.props.onClose) this.props.onClose();
    Actions.closeMapDesigner();
  }

  onCancel = () => {
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
  }

  onCreate = () =>{
    this.setState({saved: true});
    if(this.props.onCreate) this.props.onCreate(this.state.map_id, this.state.title);
  }

   privacyCheck = (isPrivate: boolean, group_id: string) => {
    //check if layers meet privacy rules, before sending a request to the server that will fail...
    if(isPrivate){
      if(!group_id){
         return this.__('Private map must be saved to a group');
      }
      //check all layers are in the same group
      var privateLayerInOtherGroup = false;
      this.state.mapLayers.forEach((layer) => {
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
      this.state.mapLayers.forEach((layer) => {
        if(layer.private){
          privateLayerInPublicMap = true;
        }
      });
      if(privateLayerInPublicMap){
        return this.__('A public map cannot contain private layers. Please save as a private map owned by your group, or remove the private layer');
      }
    }

  }


  onSave = (model: Object, cb: Function) => {
    
    var _this = this;

    var position = this.refs.map.getPosition();
    position.bbox = this.refs.map.getBounds();

    if(model.private === undefined) model.private = false;

    var err = this.privacyCheck(model.private, model.group);
    if(err){
       MessageActions.showMessage({title: _this.__('Error'), message: err});
    }else{

      var basemap = this.refs.map.getBaseMap();
      if(!this.state.map_id || this.state.map_id === -1){
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
  }

  toggleVisibility = (layer_id: number) => {
    $('.layer-card-tooltipped').tooltip('remove');
    Actions.toggleVisibility(layer_id, () => {
    });
    $('.layer-card-tooltipped').tooltip();
  }

  showLayerDesigner = (layer_id: number) => {
    var layer = _find(this.state.mapLayers, {layer_id});
    $('.layer-card-tooltipped').tooltip('remove');
    this.setState({showMapLayerDesigner: true, layerDesignerLayer: layer});
    $('.layer-card-tooltipped').tooltip();
  }

  onLayerStyleChange = (layer_id: number, style: Object, labels: Object, legend: Object, settings: Object) => {
    Actions.updateLayerStyle(layer_id, style, labels, legend, settings);
  }

  closeLayerDesigner = () => {
    this.setState({showMapLayerDesigner: false});
  }

  removeFromMap = (layer: Layer) => {
    $('.layer-card-tooltipped').tooltip('remove');
    Actions.removeFromMap(layer);
    $('.layer-card-tooltipped').tooltip();
  }

  addLayer = (layer: Layer) => {
    var _this=this;
    $('.layer-card-tooltipped').tooltip('remove');

    //clone the layer object so we don't mutate the data in the search results
    layer = JSON.parse(JSON.stringify(layer));

    if(this.state.mapLayers.length === 0 && layer.extent_bbox){
      _this.refs.map.fitBounds(layer.extent_bbox, 16, 25, false);
    }

    var position = this.refs.map.getPosition();
    position.bounds = this.refs.map.getBounds();

    Actions.setMapPosition(position);
    Actions.addToMap(layer, (err) => {
      if(err){
        NotificationActions.showNotification({message: _this.__('Map already contains this layer'), dismissAfter: 3000, position: 'topright'});
      }
      //reset stuck tooltips...
      $('.layer-card-tooltipped').tooltip();

      //switch to map tab
      _this.toggleMapTab();
    });
  }

  toggleMapTab = () => {
    $(this.refs.tabs).tabs('select_tab', 'maptab');
    fireResizeEvent();
  }

  toggleAddLayerTab = () => {
    $(this.refs.tabs).tabs('select_tab', 'addlayer');
    fireResizeEvent();

  }

  editLayer = (layer: Layer) => {
    Actions.startEditing();
    DataEditorActions.startEditing(layer);
    this.refs.map.startEditingTool(layer);
  }

  saveEdits = () => {
    DataEditorActions.saveEdits(this.state._csrf, function(){
      this.refs.map.stopEditingTool();
    });
  }

  stopEditingLayer = () => {
    Actions.stopEditing();
    DataEditorActions.stopEditing();
    this.refs.map.stopEditingTool();
  }

  onToggleForestLoss = (enabled: boolean) => {
    var mapLayers = this.state.mapLayers;
    var layers = ForestLossLegendHelper.getLegendLayers();
  
    if(enabled){
      //add layers to legend
       mapLayers = mapLayers.concat(layers);
    }else{
      var updatedLayers = [];
      //remove layers from legend
      mapLayers.forEach(mapLayer=>{
        var foundInLayers;
        layers.forEach(layer=>{
          if(mapLayer.id === layer.id){
            foundInLayers = true;
          }
        });
        if(!foundInLayers){
          updatedLayers.push(mapLayer);
        }
      });    
      mapLayers = updatedLayers;
    }
    Actions.setMapLayers(mapLayers, false);
  }

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
    }else if (!this.state.mapLayers || this.state.mapLayers.length === 0) {
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
          <ul className="tabs" ref="tabs" style={{overflowX: 'hidden', borderBottom: '1px solid #ddd'}}>
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
                  insetMap={true}
                  onChangeBaseMap={Actions.setMapBasemap}
                  onToggleForestLoss={this.onToggleForestLoss}
                  fitBounds={mapExtent}
                  mapConfig={this.props.mapConfig}
                  hash={true}
                  >
                  {editingTools}
                  </Map>

                  <MiniLegend style={{
                        position: 'absolute',
                        top: '5px',
                        left: '5px',
                        minWidth: '200px',
                        width: '25%'
                      }} layers={this.state.mapLayers} collapseToBottom={false} hideInactive={true} showLayersButton={false} />
              </div>
            </div>
        </div>
      </div>
    );
  }
}