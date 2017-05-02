var request = require('superagent-bluebird-promise');
var debug = require('../../../services/debug')('MapHubsSource');
var superagent = require('superagent');
var urlUtil = require('../../../services/url-util');
var checkClientError = require('../../../services/client-error-response').checkClientError;
import React from 'react';
var ReactDOM = require('react-dom');
var Marker = require('../Marker');
var $ =require('jquery');
var MarkerActions = require('../../../actions/map/MarkerActions');
var GJV = require("geojson-validation");
GJV.define("Position", (position) => {
    //the postion must be valid point on the earth, x between -180 and 180
    var errors = [];
    if(position[0] < -180 || position[0] > 180){
        errors.push("Longitude must be between -180 and 180");
    }
    if(position[1] < -90 || position[1] > 90){
        errors.push("Latitude must be between -90 and 90");
    }
    return errors;

});

var mapboxgl = {};
if (typeof window !== 'undefined') {
    mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");
}

var MapHubsSource = {
  load(key, source, map, mapComponent){

    if(source.type === 'geojson' && source.data){
      return request.get(source.data)
        .then((res) => {
          var geoJSON = res.body;
          if(geoJSON.features){
            geoJSON.features.forEach((feature, i)=>{
              feature.properties.mhid = i;
            });
          }
          map.addSource(key, {type: 'geojson', data: geoJSON});
        }, (error) => {
          debug('(' + mapComponent.state.id + ') ' +error);
        });
    }else{
      //load as tilejson
      var url = source.url.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl());
      return request.get(url)
        .then((res) => {
          var tileJSON = res.body;
          tileJSON.type = 'vector';

          map.on('source.load', (e) => {
            if (e.source.id === key && mapComponent.state.allowLayersToMoveMap) {
              debug('Zooming map extent of source: ' + e.source.id);
              map.fitBounds([[tileJSON.bounds[0], tileJSON.bounds[1]],
                              [tileJSON.bounds[2], tileJSON.bounds[3]]]);
            }
          });
          map.addSource(key, tileJSON);
        }, (error) => {
          debug('(' + mapComponent.state.id + ') ' +error);
        });
    }
  },
  addLayer(layer, source, map, mapComponent){

    //try to delete any old markers
    if(layer.metadata && layer.metadata['maphubs:markers']){  
      let layer_id = layer.metadata['maphubs:layer_id'];    
      $('.maphubs-marker-'+layer_id).each((i, markerDiv) => {
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
    .end((err, res) => {
      checkClientError(res, err, (err) => {
        if(err){
          debug(err);
        }else{
          var geojson = res.body;        
          // add markers to map
          geojson.features.forEach((marker, i) => {
          var valid = true;
          GJV.isFeature(marker, (valid, errs) => {
            if(!valid){
              valid = false;
              debug(errs);
            }
            GJV.isPoint(marker.geometry, (valid, errs) => {
            if(!valid){
              valid = false;
              debug(errs);
            }
         
          

          if(valid){

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

          el.addEventListener('click', (e) => {
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
          }else{
            debug('Invalid GeoJSON - Unable to draw marker');
          }
          });
          });
          });
          
        }
      },
      (cb) => {
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
      $('.maphubs-marker-'+layer_id).each((i, markerDiv) => {
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