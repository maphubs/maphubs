var React = require('react');
import {Modal, ModalContent} from '../Modal/Modal.js';
var SearchBox = require('../SearchBox');
var GroupTag = require('../Groups/GroupTag');
//var debug = require('../../services/debug')('CreateMap');
var $ = require('jquery');
var _isEmpty = require('lodash.isempty');
var _isEqual = require('lodash.isequal');
var slug = require('slug');
var Map = require('../Map/Map');
var Legend = require('../Map/Legend');
var LayerSearchResult = require('./LayerSearchResult');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var CreateMapStore = require('../../stores/CreateMapStore');
var Actions = require('../../actions/CreateMapActions');
var ConfirmationActions = require('../../actions/ConfirmationActions');
var NotificationActions = require('../../actions/NotificationActions');
var MessageActions = require('../../actions/MessageActions');

var MapLayerDesigner = require('../LayerDesigner/MapLayerDesigner');

var Editor = require('react-medium-editor');

var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');


var CreateMap = React.createClass({

  mixins:[StateMixin.connect(CreateMapStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    userMap:  React.PropTypes.bool,
    userStoryMap:  React.PropTypes.bool,
    hubStoryMap:  React.PropTypes.bool,
    hubMap:  React.PropTypes.bool,
    storyId: React.PropTypes.number,
    hubId: React.PropTypes.string,
    searchLayers: React.PropTypes.array,
    mapLayers: React.PropTypes.array,
    showVisibility: React.PropTypes.bool,
    onCreate: React.PropTypes.func,
    onSaveHubMap: React.PropTypes.func,
    onClose: React.PropTypes.func,
    showTitleEdit: React.PropTypes.bool,
    titleLabel: React.PropTypes.string,
    title: React.PropTypes.string,
    position: React.PropTypes.object,
    basemap: React.PropTypes.string,
    mapId: React.PropTypes.number
  },

  getDefaultProps() {
    return {
      userMap: false,
      userStoryMap: false,
      hubStoryMap: false,
      hubMap: false,
      storyId: null,
      hubId: null,
      showVisibility: true,
      searchLayers: null,
      mapLayers: null,
      showTitleEdit: true,
      titleLabel: '',
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

    if(this.props.storyId){
      Actions.setStoryId(this.props.storyId);
    }

    if(this.props.hubId){
      Actions.setHubId(this.props.hubId);
    }

  },

  componentDidMount(){
    this.resetSearch();
    $(this.refs.sidenav).sideNav({
      menuWidth: 300, // Default is 240
      edge: 'left', // Choose the horizontal origin
      closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
    }
    );
  },

  componentWillReceiveProps(nextProps){
    if(nextProps.storyId != this.state.story_id){
      Actions.setStoryId(nextProps.storyId);
    }

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

    if(this.props.onCreate) this.props.onCreate(this.state.map_id);
  },

  closeSidebar(){
    $(this.refs.sidenav).sideNav('hide');
  },

  onSearch(input){
    $('.layer-card-tooltipped').tooltip('remove');  //prevent stuck tooltips
    Actions.search(input, function(err){
      if(err){
        //display error to user
        MessageActions.showMessage({title: 'Error', message: err});
      }
    });
  },

  onSave(){
    $('.savebutton-tooltipped').tooltip('remove');
    var _this = this;

    if(this.props.showTitleEdit && (!this.state.title || this.state.title == '')){
      NotificationActions.showNotification({message: this.__('Please Add a Title'), dismissAfter: 5000, position: 'bottomleft'});
      return;
    }

    var position = this.refs.map.getPosition();
    position.bbox = this.refs.map.getBounds();

    var basemap = this.refs.map.getBaseMap();
    if(this.props.userMap){
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

    }else if(this.props.hubStoryMap || this.props.userStoryMap){
        if(!this.state.map_id || this.state.map_id == -1){
          Actions.createStoryMap(position, basemap, function(err){
            if(err){
              //display error to user
              MessageActions.showMessage({title: _this.__('Error'), message: err});
            }else{
              //hide designer
              Actions.closeMapDesigner();
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
    } else if(this.props.hubMap){
      this.props.onSaveHubMap(this.state.mapLayers, this.state.mapStyle, position, basemap);
      Actions.closeMapDesigner();
    }
  },

  resetSearch(){
    if (typeof window !== 'undefined') {
      $('.layer-card-tooltipped').tooltip('remove');  //prevent stuck tooltips
    }
    if(this.props.searchLayers){
      Actions.setSearchLayers(this.props.searchLayers);
    } else if (this.props.userMap || this.props.userStoryMap){
      Actions.reloadSearchLayersUser(false, function(){});
    }else if (this.props.hubMap || this.props.hubStoryMap){
      Actions.reloadSearchLayersHub(this.props.hubId, false, function(){});
    } else {
      Actions.reloadSearchLayersAll(false, function(){});
    }
  },

  handleTitleChange(title){
    Actions.setMapTitle(title);
  },

  toggleVisibility(layer_id){
    var _this = this;
    Actions.toggleVisibility(layer_id, function(){
      _this.refs.map.reload(null, _this.state.mapStyle);
    });
  },

  showLayerDesigner(layer){
    this.setState({showMapLayerDesigner: true, layerDesignerLayer: layer});
  },

  onLayerStyleChange(layer_id, style, legend){
    var _this = this;
    Actions.updateLayerStyle(layer_id, style, legend, function(){
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

  render(){
    var _this = this;
    //var baseUrl = urlUtil.getBaseUrl(config.host, config.port);

    var title = '';
    if(this.props.showTitleEdit){
      var placeholder = null;
      if(_isEmpty(this.state.title)){
        placeholder = {text: this.__('Enter a Map Title')};
      }
      title = (
        <div className="create-map-title right grey-text text-darken-4" style={{marginRight: '20px', minWidth: '200px', textAlign: 'right'}}>
          <Editor
         tag="h5"
         text={this.state.title}
         onChange={this.handleTitleChange}
         options={{buttonLabels: 'fontawesome',
           placeholder,
           disableReturn: true, buttons: []}}
       />
      </div>
      );
    }else{
      title = (
        <div className="right grey-text text-darken-4" style={{marginRight: '20px', textAlign: 'right'}}>
          <h5>{this.props.titleLabel}</h5>
        </div>
      );
    }

    var sidebarContent = '';
    if(this.state.showMapLayerDesigner){
      sidebarContent = (
        <MapLayerDesigner ref="LayerDesigner" layer={this.state.layerDesignerLayer} onStyleChange={this.onLayerStyleChange} onClose={this.closeLayerDesigner} />
      );
    }else{
      sidebarContent = (
        <div className="row s12" style={{height: '100%', padding: 0, margin: 0}}>
          <div style={{height: '40px', width: '100%'}}>
            <a onClick={this.closeSidebar} className="btn-floating create-map-side-nav-close right"
              style={{width:'40px', height: '40px', padding: 0}}>
              <i className="material-icons"  style={{lineHeight: '40px', width:'35px', height: '35px', margin: 'auto'}}>close</i></a>
          </div>

          <div style={{height: '50%'}}>
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

          <div style={{height: '50%'}}>
              <SearchBox label={this.__('Search Layers')} id="create-map-search"
                style={{width: '80%', marginTop: 0, marginLeft: 'auto', marginRight: 'auto', marginBottom: '5px'}}
                 suggestionUrl="/api/layers/search/suggestions" onSearch={this.onSearch} onReset={this.resetSearch}/>
               <div className="custom-scroll-bar" style={{height: 'calc(100% - 60px)',overflow: 'scroll'}}>
                  <ul className="collection no-margin">{
                  this.state.searchLayers.map(function (layer, i) {
                    if(!layer || !layer.layer_id){
                      return (
                        <li key={'err-' + i}
                          className="collection-item"
                          style={{height: '70px', paddingRight: '5px', paddingLeft: '5px'}}>
                          <p>{_this.__('Error Loading Layer')}</p>
                        </li>
                      );
                    }
                      return (
                        <li key={layer.layer_id}
                          className="collection-item"
                          style={{height: '70px', paddingRight: '5px', paddingLeft: '5px', paddingTop: '0px', paddingBottom: '0px', overflow: 'hidden'}}>
                            <LayerSearchResult layer={layer} onAdd={_this.addLayer} />
                        </li>
                    );
                  })
                }</ul>
                </div>
          </div>
        </div>
      );
    }


    var mapExtent = null;
    if(this.state.position && this.state.position.bbox){
      var bbox = this.state.position.bbox;
      mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]];
    }

    return (
      <Modal show={this.state.show} id="create-map-modal" className="create-map-modal" style={{overflow: 'hidden'}} dismissible={false} fixedFooter={false}>
        <ModalContent style={{padding: 0, margin: 0, height: '100%', overflow: 'hidden'}}>
          <nav className="white" style={{boxShadow: '0 0 1px rgba(0,0,0,0.7)'}}>
            {title}
            <div id="slide-out" className="side-nav fixed create-map-side-nav" style={{color: 'black'}}>
                {sidebarContent}
            </div>
            <a href="#" ref="sidenav" data-activates="slide-out" className="button-collapse show-on-large omh-btn"><i className="mdi-navigation-menu"></i></a>
          </nav>

          <div className="row create-map-content" style={{margin: 0, overflow: 'auto'}}>
            <Map ref="map" id="create-map-map" style={{height: '400px', width: '600px', margin: 'auto'}}
              glStyle={this.state.mapStyle}
              baseMap={this.state.basemap}
              onChangeBaseMap={Actions.setMapBasemap}
              fitBounds={mapExtent}
              />
            <Legend style={{width: '600px', margin: 'auto', overflow: 'auto'}}
              layers={this.state.mapLayers}/>

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
        </ModalContent>
      </Modal>
    );

  }

});

module.exports = CreateMap;
