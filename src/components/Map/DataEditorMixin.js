
var debug = require('../../services/debug')('Map/MeasureArea');
var DataEditorActions = require('../../actions/DataEditorActions');
var $ = require('jquery');
var _assignIn = require('lodash.assignIn');
var Reflux = require('reflux');
var MapboxDraw = {};
if (typeof window !== 'undefined') {
    MapboxDraw = require('../../../assets/assets/js/mapbox-gl/mapbox-gl-draw.js');
}

var DataEditorMixin = {

  getEditorStyles(){
    return [
    {
      'id': 'highlight-active-points',
      'type': 'circle',
      'filter': ['all',
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['==', 'active', 'true']],
      'paint': {
        'circle-radius': 7,
        'circle-color': '#000000'
      }
    },
    {
      'id': 'points-are-blue',
      'type': 'circle',
      'filter': ['all',
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['==', 'active', 'false']],
      'paint': {
        'circle-radius': 5,
        'circle-color': '#000088'
      }
    },
     {
        "id": "gl-draw-line",
        "type": "line",
        "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
        "layout": {
          "line-cap": "round",
          "line-join": "round"
        },
        "paint": {
          "line-color": "#D20C0C",
          "line-dasharray": [0.2, 2],
          "line-width": 2
        }
    },
    // polygon fill
    {
      "id": "gl-draw-polygon-fill",
      "type": "fill",
      "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
      "paint": {
        "fill-color": "#D20C0C",
        "fill-outline-color": "#D20C0C",
        "fill-opacity": 0.1
      }
    },
    // polygon outline stroke
    // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
    {
      "id": "gl-draw-polygon-stroke-active",
      "type": "line",
      "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#D20C0C",
        "line-dasharray": [0.2, 2],
        "line-width": 2
      }
    },
    // vertex point halos
    {
      "id": "gl-draw-polygon-and-line-vertex-halo-active",
      "type": "circle",
      "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
      "paint": {
        "circle-radius": 5,
        "circle-color": "#FFF"
      }
    },
    // vertex points
    {
      "id": "gl-draw-polygon-and-line-vertex-active",
      "type": "circle",
      "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
      "paint": {
        "circle-radius": 3,
        "circle-color": "#D20C0C",
      }
    },

    // INACTIVE (static, already drawn)
    // line stroke
    {
        "id": "gl-draw-line-static",
        "type": "line",
        "filter": ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
        "layout": {
          "line-cap": "round",
          "line-join": "round"
        },
        "paint": {
          "line-color": "#000",
          "line-width": 3
        }
    },
    // polygon fill
    {
      "id": "gl-draw-polygon-fill-static",
      "type": "fill",
      "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
      "paint": {
        "fill-color": "#000",
        "fill-outline-color": "#000",
        "fill-opacity": 0.1
      }
    },
    // polygon outline
    {
      "id": "gl-draw-polygon-stroke-static",
      "type": "line",
      "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#000",
        "line-width": 3
      }
    }
  ];
  },

  editFeature(feature){
    var _this = this;
    //get the feature from the database, since features from vector tiles can be incomplete or simplified
    DataEditorActions.selectFeature(feature.properties.mhid, feature =>{      
      if(_this.draw){
      if(!_this.draw.get(feature.geometry.id)){
        //if not already editing this feature
        _this.draw.add(feature);
        _this.updateMapLayerFilters();
      }
      
    }
    });
  },

  startEditingTool(layer){
    
    var _this = this;
    var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        point: layer.data_type === 'point',
        polygon: layer.data_type === 'polygon',
        line_string: layer.data_type === 'line',
        trash: true
    },
    styles: this.getEditorStyles()
    });
    this.draw = draw;


    $('.mapboxgl-ctrl-top-right').addClass('mapboxgl-ctrl-maphubs-edit-tool');
    this.map.addControl(draw, 'top-right');

    this.map.on('draw.create', e => {
      debug('draw create');
      var features = e.data.features;
      if(features && features.length > 0){
        features.forEach( feature => {
          DataEditorActions.createFeature(feature);
        });
      }

    });

    this.map.on('draw.update', e =>{
      debug('draw update');
      _this.updateEdits(e);
      
    });

     this.map.on('draw.delete', e =>{
       debug('draw delete');
      var features = e.features;
      if(features && features.length > 0){
        features.forEach( feature => {
          DataEditorActions.deleteFeature(feature);
        });
      }
    });

     this.map.on('draw.selectionchange', e => {
       debug('draw selection');
       //if in simple mode (e.g. not selecting vertices) then check if selected feature changed

    });

   
  },

  stopEditingTool(){   
    $('.mapboxgl-ctrl-top-right').removeClass('mapboxgl-ctrl-maphubs-edit-tool');
    this.map.removeControl(this.draw);
   
  },

  updateEdits(){
    var data = this.draw.getAll();
     if (data.features.length > 0) {
      DataEditorActions.updateFeatures(data.features);
     }
  },

  onFeatureUpdate(feature){
    if(this.draw){
      this.draw.add(feature.geojson);
    }
  },

  /**
   * Add filter to hide vector tile versions of features active in the drawing tool
   * 
   */
  updateMapLayerFilters(){

    var _this = this;
    var layer_id = this.state.editingLayer.layer_id;

    //build a new filter
    var uniqueIds = [];

    this.state.edits.forEach(edit =>{
      var mhid = edit.mhid;
      if(mhid && !uniqueIds.includes(mhid)){
        uniqueIds.push(mhid);
      }
    });

    this.state.originals.forEach(orig =>{
      var mhid = orig.mhid;
      if(mhid && !uniqueIds.includes(mhid)){
        uniqueIds.push(mhid);
      }
    });

    var hideEditingFilter = ['!in', 'mhid'].concat(uniqueIds);

    if(this.state.glStyle){
      this.state.glStyle.layers.forEach(layer => {

        //check if the layer_id matches
        var foundMatch;
        if(layer.metadata && layer.metadata['maphubs:layer_id']){
          if(layer.metadata['maphubs:layer_id'] === layer_id){
            foundMatch = true;
          }
        }else if(layer.id.endsWith(layer_id)){
          foundMatch = true;
        }
        if(foundMatch){
          //get current filter
          var filter = layer.filter;
          if(!filter || !Array.isArray(filter) || filter.length === 0 ){
            //create a new filter
            filter = hideEditingFilter;
          }else if(filter[0] === "all"){
            //add our condition to the end
            filter = layer.filter.concat(hideEditingFilter);
          }else{
            filter = ["all", filter, hideEditingFilter];
          }
           _this.map.setFilter(layer.id, filter);
        }

      });
    }
  },
};

module.exports = _assignIn(DataEditorMixin, 
Reflux.listenTo(DataEditorActions.onFeatureUpdate, 'onFeatureUpdate'));