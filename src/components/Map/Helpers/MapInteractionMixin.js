//@flow
var $ = require('jquery');
import _debounce from 'lodash.debounce';
var debug = require('../../../services/debug')('MapInteractionMixin');
import BaseMapActions from '../../../actions/map/BaseMapActions';
import MapStyles from '../Styles';
import type {GLStyle} from '../../../types/mapbox-gl-style';
/**
 * Helper functions for interacting with the map and selecting features
 */
module.exports = {
  setSelectionFilter(features: Array<Object>){
    if(this.state.glStyle){
      this.state.glStyle.layers.forEach((layer) => {
        var filter = ['in', "mhid"];
        features.forEach((feature) => {
          filter.push(feature.properties.mhid);
        });
        if(this.map.getLayer(layer.id) && 
          filter[2] //found a mhid
          ){
          if(layer.id.startsWith('omh-hover-point')){
            this.map.setFilter(layer.id,  ["all", ["in", "$type", "Point"], filter]);
          }else if(layer.id.startsWith('omh-hover-line')){
            this.map.setFilter(layer.id,  ["all", ["in", "$type", "LineString"], filter]);
          }else if(layer.id.startsWith('omh-hover-polygon')){
            this.map.setFilter(layer.id,  ["all", ["in", "$type", "Polygon"], filter]);
          }
        }
      });
    }
  },

  clearSelectionFilter(){
    if(this.state.glStyle){
      this.state.glStyle.layers.forEach((layer) => {
        if(layer.id.startsWith('omh-hover')){
          if(this.map.getLayer(layer.id)){
            this.map.setFilter(layer.id,  ["==", "mhid", ""]);
          }
        }
      });
    }
  },

  handleUnselectFeature(){
    this.setState({selected:false});
    this.clearSelection();
  },

  clearSelection(){
    if(this.map.hasClass('selected')){
      this.map.removeClass('selected');
    }
    this.clearSelectionFilter();
    this.setState({selectedFeature: undefined});
  },

  getInteractiveLayers(glStyle: GLStyle){
    var interactiveLayers = [];
    if(glStyle){
      glStyle.layers.forEach((layer) => {
        if(layer.metadata && layer.metadata['maphubs:interactive'] &&
          (layer.id.startsWith('omh')
          || layer.id.startsWith('osm'))
        ){
          interactiveLayers.push(layer.id);
        }
      });
    }
    return interactiveLayers;
  },

  clickHandler(e: any){
    var map = this.map;

    if(this.state.enableMeasurementTools){
      return;
    }
    else{
      //feature selection
      if(!this.state.selected && this.state.selectedFeature){
        this.setState({selected:true});
      }else{
        $(this.refs.map).find('.mapboxgl-canvas-container').css('cursor', 'crosshair');

        var features = map.queryRenderedFeatures(
          [
            [e.point.x - this.props.interactionBufferSize / 2, e.point.y - this.props.interactionBufferSize / 2],
            [e.point.x + this.props.interactionBufferSize / 2, e.point.y + this.props.interactionBufferSize / 2]
          ], {layers: this.state.interactiveLayers});

        if (features && features.length) {          
          if(this.state.selected){
            this.clearSelection();
          }

           var feature = features[0];
           //find presets and add to props
           if(feature.layer && feature.layer.source){
             let presets = MapStyles.settings.getSourceSetting(this.state.glStyle, feature.layer.source, 'presets');
             if(!feature.properties['maphubs_metadata']){
               feature.properties['maphubs_metadata'] = {};
             }
             feature.properties['maphubs_metadata'].presets = presets;
           }
        
          if(this.state.editing){
            if(feature.properties.layer_id && 
              this.state.editingLayer.layer_id === feature.properties.layer_id){
                this.editFeature(feature);
              }    
            return; //return here to disable interactation with other layers when editing
          }
          
          this.setSelectionFilter([features[0]]);
          this.setState({selectedFeature:features[0], selected:true});
        } 
        else if(this.state.selectedFeature) {
          this.clearSelection();
            this.setState({selected: false});
            $(this.refs.map).find('.mapboxgl-canvas-container').css('cursor', '');
          }
      }
    }
  },

  moveendHandler(){
     debug('mouse up fired');
    BaseMapActions.updateMapPosition(this.getPosition(), this.getBounds());
  },

  //fires whenever mouse is moving across the map... use for cursor interaction... hover etc.
 mousemoveHandler(e: any){
    var map = this.map;
    var _this = this;
   
    if(_this.state.enableMeasurementTools){
      return;
    }
    else{
      var debounced = _debounce(() => {
        if(_this.state.mapLoaded && _this.state.restoreBounds){
          debug('(' + _this.state.id + ') ' +"clearing restoreBounds");
          _this.setState({restoreBounds:null});
          //stop restoring map possition after user has moved the map
        }

        var features = map.queryRenderedFeatures(
          [
            [e.point.x - _this.props.interactionBufferSize / 2, e.point.y - _this.props.interactionBufferSize / 2],
            [e.point.x + _this.props.interactionBufferSize / 2, e.point.y + _this.props.interactionBufferSize / 2]
          ],
        {layers: _this.state.interactiveLayers});

        if (features && features.length) {
          if(_this.state.selected){
            $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', 'crosshair');
          } else if(_this.props.hoverInteraction){
            $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', 'crosshair');
            //_this.setSelectionFilter(features);
            //_this.setState({selectedFeatures:features});
          }else{
            $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', 'pointer');
          }
        } else if(!_this.state.selected && _this.state.selectedFeatures !== null) {
            _this.clearSelection();
            $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', '');
        } else {
          $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', '');
        }

      }, 300).bind(this);
      debounced();
  }
  }
};