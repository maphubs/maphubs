//@flow
var $ = require('jquery');
import _debounce from 'lodash.debounce';
var debug = require('../../../services/debug')('MapInteractionMixin');
import BaseMapActions from '../../../actions/map/BaseMapActions';
import MapStyles from '../Styles';
/**
 * Helper functions for interacting with the map and selecting features
 */
export default function() {
  var _this = this;
  this.setSelectionFilter = (features) => {
    if(_this.state.glStyle){
      _this.state.glStyle.layers.forEach((layer) => {
        var filter = ['in', "mhid"];
        features.forEach((feature) => {
          filter.push(feature.properties.mhid);
        });
        if(_this.map.getLayer(layer.id)){
          if(layer.id.startsWith('omh-hover-point')){
            _this.map.setFilter(layer.id,  ["all", ["in", "$type", "Point"], filter]);
          }else if(layer.id.startsWith('omh-hover-line')){
            _this.map.setFilter(layer.id,  ["all", ["in", "$type", "LineString"], filter]);
          }else if(layer.id.startsWith('omh-hover-polygon')){
            _this.map.setFilter(layer.id,  ["all", ["in", "$type", "Polygon"], filter]);
          }
        }
      });
    }
  };

  this.clearSelectionFilter = () => {
    if(_this.state.glStyle){
      _this.state.glStyle.layers.forEach((layer) => {
        if(layer.id.startsWith('omh-hover')){
          if(_this.map.getLayer(layer.id)){
            _this.map.setFilter(layer.id,  ["==", "mhid", ""]);
          }
        }
      });
    }
  };

  this.handleUnselectFeature = () => {
    _this.setState({selected:false});
    _this.clearSelection();
  };

  this.clearSelection = () => {
    if(_this.map.hasClass('selected')){
      _this.map.removeClass('selected');
    }
    _this.clearSelectionFilter();
    _this.setState({selectedFeatures:null});
  };

  this.getInteractiveLayers = (glStyle) => {
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
  };

  this.clickHandler = (e) => {
    var map = this.map;

    if(_this.state.enableMeasurementTools){
      return;
    }
    else{
      //feature selection
      if(!_this.state.selected &&_this.state.selectedFeatures && _this.state.selectedFeatures.length > 0){
        _this.setState({selected:true});
      }else{
        $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', 'crosshair');

        var features = map.queryRenderedFeatures(
          [
            [e.point.x - _this.props.interactionBufferSize / 2, e.point.y - _this.props.interactionBufferSize / 2],
            [e.point.x + _this.props.interactionBufferSize / 2, e.point.y + _this.props.interactionBufferSize / 2]
          ], {layers: _this.state.interactiveLayers});

        if (features && features.length) {          
          if(_this.state.selected){
            _this.clearSelection();
          }

           var feature = features[0];
           //find presets and add to props
           if(feature.layer && feature.layer.source){
             let presets = MapStyles.settings.getSourceSetting(_this.state.glStyle, feature.layer.source, 'presets');
             if(!feature.properties['maphubs_metadata']){
               feature.properties['maphubs_metadata'] = {};
             }
             feature.properties['maphubs_metadata'].presets = presets;
           }
        

          if(_this.state.editing){
            if(feature.properties.layer_id && 
              _this.state.editingLayer.layer_id === feature.properties.layer_id){
                _this.editFeature(feature);
              }    
            return; //return here to disable interactation with other layers when editing
          }
          

          _this.setSelectionFilter([features[0]]);
          _this.setState({selectedFeatures:[features[0]], selected:true});
          map.addClass('selected');
          } else if(_this.state.selectedFeatures !== null) {
              _this.clearSelection();
              _this.setState({selected: false});
              $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', '');
          }
      }
    }
  };

  this.moveendHandler = (e) => {
     debug('mouse up fired');
    BaseMapActions.updateMapPosition(_this.getPosition(), _this.getBounds());
  };

  //fires whenever mouse is moving across the map... use for cursor interaction... hover etc.
 this.mousemoveHandler = (e) => {
    var map = this.map;
    var _this = this;
   
    if(_this.state.enableMeasurementTools){
      return;
    }
    else{

      if(_this.state.showBaseMaps) return;

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
            _this.setSelectionFilter(features);
            _this.setState({selectedFeatures:features});
            map.addClass('selected');
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
  };
}