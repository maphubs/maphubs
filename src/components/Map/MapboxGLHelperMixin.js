var _includes = require('lodash.includes');
var debug = require('../../services/debug')('mapboxGLHelperMixin');
var mapboxgl = {};
if (typeof window !== 'undefined') {
    mapboxgl = require("../../../assets/assets/js/mapbox-gl/mapbox-gl-0-32-1.js");
}

/**
 * Helper functions for interfacing with MapboxGL
 */
var MapboxGLHelperMixin = {
  getBounds(){
    if(this.map){
      return this.map.getBounds().toArray();
    }
  },

  getPosition(){
    if(this.map){
      var center =this.map.getCenter();
      var zoom = this.map.getZoom();
      return {
          zoom,
          lng: center.lng,
          lat: center.lat
      };
    }
  },

  updatePosition() {
    debug('(' + this.state.id + ') ' +'UPDATE POSITION');
    var map = this.map;
    map.setView(this.state.map.position.center, this.state.map.position.zoom, {animate: false});
  },

  flyTo(center, zoom){
    this.map.flyTo({center, zoom});
  },

  getBoundsObject(bbox){
    var sw = new mapboxgl.LngLat(bbox[0], bbox[1]);
    var ne = new mapboxgl.LngLat(bbox[2], bbox[3]);
    return new mapboxgl.LngLatBounds(sw, ne);
  },

  fitBounds(bbox, maxZoom, padding = 0, animate = true){
    var sw = new mapboxgl.LngLat(bbox[0], bbox[1]);
    var ne = new mapboxgl.LngLat(bbox[2], bbox[3]);
    var llb = new mapboxgl.LngLatBounds(sw, ne);
    this.map.fitBounds(llb, {padding, curve: 1, speed:0.6, maxZoom, animate});
  },

  changeLocale(locale, map){
    var supportedLangauges = ['en', 'fr', 'es', 'de', 'de', 'ru', 'zh'];
    var foundLocale = _includes(supportedLangauges, locale);
    if(!foundLocale){
      //Mapbox vector tiles currently only have en,es,fr,de,ru,zh
      locale = 'en';
    }
    debug('(' + this.state.id + ') ' +'changing map language to: ' + locale);
    try{
    map.setLayoutProperty('country-label-lg', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('country-label-md', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('country-label-sm', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('state-label-lg', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_point_other', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_point_3', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_point_2', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_point_1', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_line_other', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_line_3', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_line_2', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_line_1', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_neighborhood', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_other', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_city_small_s', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_city_small_n', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_city_medium_s', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_city_medium_n', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_city_large_s', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_city_large_n', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('road-label-sm', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('road-label-med', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('road-label-large', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('airport-label', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('poi-parks-scalerank1', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('poi-scalerank1', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('waterway-label', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('water-label', 'text-field', '{name_' + locale + '}');
    }catch(err){
      debug(err);
    }


  },
};

module.exports = MapboxGLHelperMixin;