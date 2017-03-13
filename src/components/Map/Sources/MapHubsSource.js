var request = require('superagent-bluebird-promise');
var debug = require('../../../services/debug')('MapHubsSource');
var superagent = require('superagent');
var urlUtil = require('../../../services/url-util');
var checkClientError = require('../../../services/client-error-response').checkClientError;
var React = require('react');
var ReactDOM = require('react-dom');
var Marker = require('../Marker');
var $ =require('jquery');
var MarkerActions = require('../../../actions/map/MarkerActions');
var _bbox = require('@turf/bbox');

var mapboxgl = {};
if (typeof window !== 'undefined') {
    mapboxgl = require("../../../../assets/assets/js/mapbox-gl/mapbox-gl-0-32-1.js");
}

var MapHubsSource = {
  load(key, source, map, mapComponent){

    if(source.type === 'geojson' && source.data){
      return request.get(source.data)
        .then(function(res) {
          var geoJSON = res.body;
          if(geoJSON.features){
            geoJSON.features.forEach((feature, i)=>{
              feature.properties.mhid = i;
            });
          }
          map.addSource(key, {type: 'geojson', data: geoJSON});
        }, function(error) {
          debug('(' + mapComponent.state.id + ') ' +error);
        });
    }else{
      //load as tilejson
      var url = source.url.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl());
      return request.get(url)
        .then(function(res) {
          var tileJSON = res.body;
          tileJSON.type = 'vector';

          map.on('source.load', function(e) {
            if (e.source.id === key && mapComponent.state.allowLayersToMoveMap) {
              debug('Zooming map extent of source: ' + e.source.id);
              map.fitBounds([[tileJSON.bounds[0], tileJSON.bounds[1]],
                              [tileJSON.bounds[2], tileJSON.bounds[3]]]);
            }
          });
          map.addSource(key, tileJSON);
        }, function(error) {
          debug('(' + mapComponent.state.id + ') ' +error);
        });
    }
  },
  addLayer(layer, source, map, mapComponent){

    //try to delete any old markers
    if(layer.metadata && layer.metadata['maphubs:markers']){  
      let layer_id = layer.metadata['maphubs:layer_id'];    
      $('.maphubs-marker-'+layer_id).each(function(i, markerDiv){
        ReactDOM.unmountComponentAtNode(markerDiv);
        $(markerDiv).remove();
      });
      MarkerActions.removeLayer(layer_id);     
    }

    if(layer.metadata 
      && layer.metadata['maphubs:markers'] 
      && layer.metadata['maphubs:markers'].enabled
      && !(layer.layout && layer.layout.visibility && layer.layout.visibility === 'none')
      ){
      var markerConfig = JSON.parse(JSON.stringify(layer.metadata['maphubs:markers']));
      markerConfig.dataUrl = markerConfig.dataUrl.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl());
      var layer_id = layer.metadata['maphubs:layer_id'];
    //load geojson for this layer
    var geojsonUrl = markerConfig.dataUrl;
    if(source.type === 'geojson'){
      geojsonUrl = source.data;
    }
     superagent.get(geojsonUrl)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, function(err){
        if(err){
          debug(err);
        }else{
          var geojson = res.body;        
          // add markers to map
          geojson.features.forEach(function(marker, i) {

          var markerId;
          if(marker.properties.osm_id){
            marker.properties.mhid = layer_id + ':' + marker.properties.osm_id;
          }else if(marker.properties['id']){
            marker.properties.mhid = layer_id + ':' + marker.properties['id'];
          }else if(marker.properties['ID']){
            marker.properties.mhid = layer_id + ':' + marker.properties['ID'];
          }else if(marker.properties['OBJECTID']){
            marker.properties.mhid = layer_id + ':' + marker.properties['OBJECTID'];
          }else{
            marker.properties.mhid = layer_id + ':' + i;
          }
          markerId = marker.properties.mhid;
           
          // create a DOM element for the marker
          var el = document.createElement('div');
          el.className = 'maphubs-marker-'+layer_id;
          el.style.width = markerConfig.width + 'px';
          el.style.height = markerConfig.height + 'px';

          el.addEventListener('click', function(e){
            e.stopPropagation();
            marker.properties.layer_id = layer_id;
            //
            if(mapComponent.state.editing){
              if(mapComponent.state.editingLayer.layer_id === marker.properties.layer_id){
                mapComponent.editFeature(marker);
              }    
            return; //return here to disable interactation with other layers when editing
          }
            mapComponent.setSelectionFilter([marker]);
            mapComponent.setState({selectedFeatures:[marker], selected:true});
            map.addClass('selected');
          });

          ReactDOM.render(
            <Marker  {...markerConfig}/>,
            el
          );

          var offsetWidth = -markerConfig.width / 2;
          var offsetHeight;
          if(markerConfig.shape === 'MAP_PIN' || markerConfig.shape  === 'SQUARE_PIN'){
            offsetHeight = -markerConfig.height;
          }else{
            offsetHeight = -markerConfig.height / 2;
          }

          var mapboxMarker = new mapboxgl.Marker(el, {offset: [offsetWidth, offsetHeight]})
              .setLngLat(marker.geometry.coordinates)
              .addTo(map);
          

          MarkerActions.addMarker(layer_id, markerId, mapboxMarker);
          
          });
          
        }
      },
      function(cb){
        cb();
      }
      );
    });    
    }else if(layer.metadata && layer.metadata['maphubs:showBehindBaseMapLabels']){
      map.addLayer(layer, 'water');
    }else{
      if(mapComponent.state.editing){
        map.addLayer(layer, mapComponent.getFirstDrawLayerID());
      }else{
        map.addLayer(layer);
      }
      
    }
  },
  removeLayer(layer, map){
    if(layer.metadata && layer.metadata['maphubs:markers']){  
      let layer_id = layer.metadata['maphubs:layer_id'];    
      $('.maphubs-marker-'+layer_id).each(function(i, markerDiv){
        ReactDOM.unmountComponentAtNode(markerDiv);
        $(markerDiv).remove();
      });
      MarkerActions.removeLayer(layer_id);
    }
    map.removeLayer(layer.id);
  },
  remove(key, map){
    map.removeSource(key);
  }
};

module.exports = MapHubsSource;