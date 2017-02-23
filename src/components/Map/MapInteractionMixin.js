
var $ = require('jquery');
var _debounce = require('lodash.debounce');
var debug = require('../../services/debug')('MapInteractionMixin');
var BaseMapActions = require('../../actions/map/BaseMapActions');
/**
 * Helper functions for interacting with the map and selecting features
 */
var MapInteractionMixin = {

  setSelectionFilter(features){
    var _this = this;
    if(this.state.glStyle){
      this.state.glStyle.layers.forEach(function(layer){
        var filter = ['in', "mhid"];
        features.forEach(function(feature){
          filter.push(feature.properties.mhid);
        });
        if(layer.id.startsWith('omh-hover-point')){
          _this.map.setFilter(layer.id,  ["all", ["in", "$type", "Point"], filter]);
        }else if(layer.id.startsWith('omh-hover-line')){
          _this.map.setFilter(layer.id,  ["all", ["in", "$type", "LineString"], filter]);
        }else if(layer.id.startsWith('omh-hover-polygon')){
          _this.map.setFilter(layer.id,  ["all", ["in", "$type", "Polygon"], filter]);
        }
      });
    }
  },

  clearSelectionFilter(){
    var _this = this;
    if(this.state.glStyle){
      this.state.glStyle.layers.forEach(function(layer){
        if(layer.id.startsWith('omh-hover')){
          _this.map.setFilter(layer.id,  ["==", "mhid", ""]);
        }
      });
    }
  },

  handleUnselectFeature() {
    this.setState({selected:false});
    this.clearSelection();
  },

  clearSelection(){
    if(this.map.hasClass('selected')){
      this.map.removeClass('selected');
    }
    this.clearSelectionFilter();
    this.setState({selectedFeatures:null});
  },

  getInteractiveLayers(glStyle){
    var interactiveLayers = [];
    if(glStyle){
      glStyle.layers.forEach(function(layer){
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

  clickHandler(e){
    var map = this.map;
    var _this = this;

    if(this.state.enableMeasurementTools){
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

        if (features.length) {
          if(_this.state.selected){
            _this.clearSelection();
          }
          _this.setSelectionFilter([features[0]]);
          _this.setState({selectedFeatures:[features[0]], selected:true});
          map.addClass('selected');
          } else if(_this.state.selectedFeatures != null) {
              _this.clearSelection();
              _this.setState({selected: false});
              $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', '');
          }
      }
    }
  },

  moveendHandler(e){
     debug('mouse up fired');
     if(this.refs.insetMap){
       this.refs.insetMap.updateInsetGeomFromBounds(this.map.getBounds(), this.map.getZoom());
     }
    BaseMapActions.updateMapPosition(this.getPosition(), this.getBounds());
  },

  //fires whenever mouse is moving across the map... use for cursor interaction... hover etc.
  mousemoveHandler(e){
    var map = this.map;
    var _this = this;
   
    if(this.state.enableMeasurementTools){
      return;
    }
    else{

      if(_this.state.showBaseMaps) return;

      var debounced = _debounce(function(){
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

        if (features.length) {
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
        } else if(!_this.state.selected && _this.state.selectedFeatures != null) {
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

module.exports = MapInteractionMixin;