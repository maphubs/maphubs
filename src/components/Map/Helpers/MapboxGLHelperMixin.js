//var _includes = require('lodash.includes');
var debug = require('../../../services/debug')('mapboxGLHelperMixin');
var mapboxgl = {};
if (typeof window !== 'undefined') {
    mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");
}

/**
 * Helper functions for interfacing with MapboxGL
 */
export default function(){
  var _this = this;
  this.getBounds = () => {
    if(_this.map){
      return _this.map.getBounds().toArray();
    }
  };

  this.getPosition = () => {
    if(_this.map){
      var center =_this.map.getCenter();
      var zoom = _this.map.getZoom();
      return {
          zoom,
          lng: center.lng,
          lat: center.lat
      };
    }
  };

  this.updatePosition = () => {
    debug('(' + _this.state.id + ') ' +'UPDATE POSITION');
    var map = _this.map;
    map.setView(_this.state.map.position.center, _this.state.map.position.zoom, {animate: false});
  };

  this.flyTo = (center, zoom) => {
    _this.map.flyTo({center, zoom});
  };

  this.getBoundsObject = (bbox) => {
    var sw = new mapboxgl.LngLat(bbox[0], bbox[1]);
    var ne = new mapboxgl.LngLat(bbox[2], bbox[3]);
    return new mapboxgl.LngLatBounds(sw, ne);
  };

  this.fitBounds = (bbox, maxZoom, padding = 0, animate = true) => {
    var sw = new mapboxgl.LngLat(bbox[0], bbox[1]);
    var ne = new mapboxgl.LngLat(bbox[2], bbox[3]);
    var llb = new mapboxgl.LngLatBounds(sw, ne);
    _this.map.fitBounds(llb, {padding, curve: 1, speed:0.6, maxZoom, animate});
  };

  this.changeLocale = (locale, map) => {
  //disable until OpenMapTile has translations;
    /*
    var supportedLangauges = ['en', 'fr', 'es', 'de', 'de', 'ru', 'zh'];
    var foundLocale = _includes(supportedLangauges, locale);
    if(!foundLocale){
      //Mapbox vector tiles currently only have en,es,fr,de,ru,zh
      locale = 'en';
    }
    debug('(' + this.state.id + ') ' +'changing map language to: ' + locale);
    try{
      if(this.state.baseMap === 'streets'){
        map.setLayoutProperty('continent', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('state', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('water_name_line', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('water_name_point', 'text-field', '{name_' + locale + '}');
      }else if(this.state.baseMap === 'default'){
        map.setLayoutProperty('place_country_major', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_country_other', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_state', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_city_large', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_capital', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_city', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_town', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_village', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_suburb', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_other', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('water_name', 'text-field', '{name_' + locale + '}');
            
      }else if(this.state.baseMap === 'dark'){
        map.setLayoutProperty('place_country_major', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_country_other', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_state', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_city_large', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_city', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_town', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_village', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_suburb', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('place_other', 'text-field', '{name_' + locale + '}');
        map.setLayoutProperty('water_name', 'text-field', '{name_' + locale + '}');
            
      }
   
    }catch(err){
      debug(err);
    }
*/

  };
}