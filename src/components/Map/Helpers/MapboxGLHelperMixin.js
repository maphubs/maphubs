//@flow
var debug = require('../../../services/debug')('mapboxGLHelperMixin');

/**
 * Helper functions for interfacing with MapboxGL
 */
module.exports = {

  getBounds(){
    if(this.map){
      return this.map.getBounds().toArray();
    }
  },

  getPosition(){
    if(this.map){
      var center = this.map.getCenter();
      var zoom = this.map.getZoom();
      return {
          zoom,
          lng: center.lng,
          lat: center.lat
      };
    }
  },

  updatePosition(){
    debug('(' + this.state.id + ') ' +'UPDATE POSITION');
    var map = this.map;
    map.setView(this.state.map.position.center, this.state.map.position.zoom, {animate: false});
  },

  flyTo(center: any, zoom: number){
    this.map.flyTo({center, zoom});
  },

  getBoundsObject(bbox: Array<number>){
    return [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
  },

  fitBounds(bbox: Array<number>, maxZoom: number, padding: number = 0, animate: boolean = true){
    var bounds = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
    this.map.fitBounds(bounds, {padding, curve: 1, speed:0.6, maxZoom, animate});
  },

  changeLocale(locale: string, map: any){
  if(!locale || !map){
    debug('missing required args');
  }
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

  }
};