import Reflux from 'reflux';
import Actions from '../../actions/map/BaseMapActions';
const debug = require('../../services/debug')('stores/BaseMapStore');
const request = require('superagent');
import _bboxPolygon from '@turf/bbox-polygon';
import _intersect from '@turf/intersect';
import _debounce from 'lodash.debounce';
import _distance from '@turf/distance';
import _find from 'lodash.find';

//var positron = require('../../components/Map/BaseMaps/positron.json');
//var darkmatter = require('../../components/Map/BaseMaps/darkmatter.json');
//var osmLiberty = require('../../components/Map/BaseMaps/osm-liberty.json');
//var osmBright = require('../../components/Map/BaseMaps/osm-liberty.json');
const positronTz = require('../../components/Map/BaseMaps/positron-tz.json');
const darkmatterTz = require('../../components/Map/BaseMaps/darkmatter-tz.json');
const osmLibertyTz= require('../../components/Map/BaseMaps/osm-liberty-tz.json');
const osmBrightTz = require('../../components/Map/BaseMaps/osm-liberty-tz.json');
const defaultBaseMapOptions = require('../../components/Map/BaseMaps/base-map-options.json');

export type BaseMapOption = {
  value: string,
  label: LocalizedString,
  attribution: string,
  updateWithMapPosition: boolean,
  style: Object,
  loadFromFile: string

}

export type  BaseMapStoreState = {
  baseMap: string,
  attribution: string,
  bingImagerySet: ?string,
  updateWithMapPosition: boolean,
  baseMapOptions: Array<BaseMapOption>
}

export default class BaseMapStore extends Reflux.Store {

  state: BaseMapStoreState

  constructor(){
    super();
    this.state = {
      baseMap: 'default',
      attribution: '© Mapbox © OpenStreetMap',
      bingImagerySet: null,
      updateWithMapPosition: false,
      baseMapOptions: defaultBaseMapOptions
    };
    this.listenables = Actions;
  }

  setBaseMap(baseMap){
    this.setState({baseMap});
  }

  debouncedUpdateMapPosition = _debounce(function(position, bbox){
    const _this = this;

    if(_this.position){
      const from = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [_this.position.lng, _this.position.lat]
        }
      };
      const to = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [position.lng, position.lat]
        }
      };
      const distance = _distance(from, to, "kilometers");
      debug.log('map moved: ' + distance + 'km');     
      if(distance < 50 && Math.abs(_this.position.zoom - position.zoom) < 1){
        _this.position = position;
        return;
      } 
    }

    const bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
      const lat = position.lat;
      const lng = position.lng;
      const zoom = Math.round(position.zoom);
      const url = `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/${this.state.bingImagerySet}/${lat},${lng}?zl=${zoom}&include=ImageryProviders&key=${MAPHUBS_CONFIG.BING_KEY}`;
      let attributionString = '© Bing Maps';
      request.get(url)
      .end((err, res) => {
        if(err){
          debug.error(err);
        }else{
          const metadata = res.body;
          const attributions = [];


          const bboxFeature = _bboxPolygon(bounds);
          if(metadata.resourceSets && metadata.resourceSets.length > 0 
            && metadata.resourceSets[0].resources && metadata.resourceSets[0].resources.length > 0 
            && metadata.resourceSets[0].resources[0].imageryProviders && metadata.resourceSets[0].resources[0].imageryProviders.length > 0){
            const resource = metadata.resourceSets[0].resources[0];
            let imageryTime = '';
            if(resource.vintageEnd){
              imageryTime = '<b class="no-margin no-padding">(' + resource.vintageEnd + ')</b>';
            }
            const imageryProviders = resource.imageryProviders;
            imageryProviders.forEach((provider) => {
            for (let i = 0; i < provider.coverageAreas.length; i++) {
              const providerBboxFeature = _bboxPolygon(provider.coverageAreas[i].bbox);
            
              if (_intersect(bboxFeature, providerBboxFeature) &&
                zoom >= provider.coverageAreas[i].zoomMin &&
                zoom <= provider.coverageAreas[i].zoomMax) {
                attributions.push(provider.attribution);
              }
            }
            });
             attributionString =  attributionString + ': ' + imageryTime + ' ' + attributions.toString();
          }     
          _this.position = position;
          _this.setState({attribution: attributionString});
      }
    });

  });

  //Inspired by: https://github.com/gmaclennan/leaflet-bing-layer
  updateMapPosition(position, bbox){
   
    //ignore unless using a service that needs this... like Bing
    if(this.state.updateWithMapPosition){
      this.debouncedUpdateMapPosition(position, bbox);
    }
      
  }

 getBingSource(type, cb){
    const url = `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/${type}?key=${MAPHUBS_CONFIG.BING_KEY}&include=ImageryProviders`;
    request.get(url)
    .end((err, res) => {
      if(err){
        debug.error(err);
      }else{
        const metadata = res.body;
        //don't actually need anything from bing
        cb(metadata);
      }
    });
  }

  setMapzenKey(style){
    style.sources.mapzen.tiles = style.sources.mapzen.tiles.map((tile)=>{
      return tile.replace('{key}', MAPHUBS_CONFIG.MAPZEN_API_KEY);
    });
    return style;
  }
  

  loadFromFile(name, cb){
    if(name === 'positron'){
      cb(this.setMapzenKey(positronTz));
    }else if(name === 'darkmatter'){
      cb(this.setMapzenKey(darkmatterTz));
    }else if(name === 'osmLiberty'){
      cb(this.setMapzenKey(osmLibertyTz));
    }else if(name === 'osmBright'){
      cb(this.setMapzenKey(osmBrightTz));
    }else{
      debug.log(`unknown base map file: ${name}`);
      cb(positronTz);
    }
  }

  getBaseMapFromName(mapName, cb){

    const config = _find(this.state.baseMapOptions, {value: mapName});

    if(config){

      this.setState({
        attribution: config.attribution,
        updateWithMapPosition: config.updateWithMapPosition
      });
      if(mapName === 'bing-satellite'){
        this.getBingSource('Aerial', () => {
        this.setState({
          bingImagerySet: 'Aerial'
        });
        const style = config.style;
        if(!style.glyphs){
          style.glyphs = "https://free.tilehosting.com/fonts/{fontstack}/{range}.pbf?key={key}";
        }

        if(!style.sprite){
          style.sprite = "";
        }
        cb(style);
      });
      }else if(config.loadFromFile){
        this.loadFromFile(config.loadFromFile, cb);
      }else if(config.style){
        const style = config.style;
        if(typeof style !== 'string'){
          if(!style.glyphs){
            style.glyphs = "https://free.tilehosting.com/fonts/{fontstack}/{range}.pbf?key={key}";
          }

          if(!style.sprite){
            style.sprite = "";
          }
        }

        cb(style);
      }else if(config.url){

        request.get(config.url)
        .end((err, res) => {
          if(err){
            debug.error(err);
          }else{
            cb(res.body);
          }
        });
      }
      else if(config.mapboxUrl){
        //example: mapbox://styles/mapbox/streets-v8?optimize=true
        //converted to: //https://api.mapbox.com/styles/v1/mapbox/streets-v9?access_token=
        let url = config.mapboxUrl.replace('mapbox://styles/', 'https://api.mapbox.com/styles/v1/');
        if(config.mapboxUrl.endsWith('?optimize=true')){
          url = url + '&access_token=' + MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN;
        }else{
          url = url + '?access_token=' + MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN;
        }

        request.get(url)
        .end((err, res) => {
          if(err){
            debug.error(err);
          }else{
            cb(res.body);
          }
        });
      }
      else{
          debug.log(`map style not found for base map: ${mapName}`);
      }      
    }else{
      debug.log(`unknown base map: ${mapName}`);
      //load the  default basemap
      const defaultConfig = _find(defaultBaseMapOptions, {value: 'default'});
       this.setState({
        attribution: defaultConfig.attribution,
        updateWithMapPosition: defaultConfig.updateWithMapPosition
      });
      this.loadFromFile(defaultConfig.loadFromFile, cb);
    }

  }

}