var request = require('superagent-bluebird-promise');
var debug = require('../../../services/debug')('MapHubsSource');
var superagent = require('superagent');
var urlUtil = require('../../../services/url-util');
var checkClientError = require('../../../services/client-error-response').checkClientError;
var React = require('react');
var ReactDOM = require('react-dom');
var Marker = require('../Marker');
var $ =require('jquery');

var mapboxgl = {};
if (typeof window !== 'undefined') {
    mapboxgl = require("../../../../assets/assets/js/mapbox-gl/mapbox-gl.js");
}

var MapHubsSource = {
  load(key, source, map, mapComponent){
    //load as tilejson
    var url = source.url.replace('{MAPHUBS_DOMAIN}', MAPHUBS_CONFIG.tileServiceUrl);
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
  },
  addLayer(layer, source, map, mapComponent){

    //try to delete any old markers
    if(layer.metadata && layer.metadata['maphubs:markers']){  
      let layer_id = layer.metadata['maphubs:layer_id'];    
      $('.maphubs-marker-'+layer_id).each(function(i, markerDiv){
        ReactDOM.unmountComponentAtNode(markerDiv);
        $(markerDiv).remove();
      });
    }

    if(layer.metadata && layer.metadata['maphubs:markers'] && layer.metadata['maphubs:markers'].enabled){
      var markerConfig = JSON.parse(JSON.stringify(layer.metadata['maphubs:markers']));
      markerConfig.dataUrl = markerConfig.dataUrl.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl());
      var layer_id = layer.metadata['maphubs:layer_id'];
    //load geojson for this layer
     superagent.get(markerConfig.dataUrl)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, function(err){
        if(err){
          debug(err);
        }else{
          var geojson = res.body;        
          // add markers to map
          geojson.features.forEach(function(marker) {
           
          // create a DOM element for the marker
          var el = document.createElement('div');
          el.className = 'maphubs-marker-'+layer_id;
          el.style.width = markerConfig.width + 'px';
          el.style.height = markerConfig.height + 'px';

          el.addEventListener('click', function(e){
            e.stopPropagation();
            marker.properties.layer_id = layer_id;
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

          new mapboxgl.Marker(el, {offset: [offsetWidth, offsetHeight]})
              .setLngLat(marker.geometry.coordinates)
              .addTo(map);
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
      map.addLayer(layer);
    }
  },
  removeLayer(layer, map){
    if(layer.metadata && layer.metadata['maphubs:markers']){  
      let layer_id = layer.metadata['maphubs:layer_id'];    
      $('.maphubs-marker-'+layer_id).each(function(i, markerDiv){
        ReactDOM.unmountComponentAtNode(markerDiv);
        $(markerDiv).remove();
      });
    }
    map.removeLayer(layer.id);
  },
  remove(key, map){
    map.removeSource(key);
  }
};

module.exports = MapHubsSource;