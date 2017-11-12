//@flow
var MapboxGLRegexSearch = require('mapbox-gl-regex-query/dist/mapbox-gl-regex-query-dev');
import _includes from 'lodash.includes';
var debug = require('../../../services/debug')('MapSearchMixin');
import _find from 'lodash.find';
import _bbox from '@turf/bbox';
var uuid = require('uuid').v1;

import type {GLSource, GLLayer} from '../../../types/mapbox-gl-style';

module.exports = {

  getSearchFilters(query: string){
    let _this = this;
    query = `/.*${query}.*/ig`;
    let sourceIDs = [];
    let queries = [];
    if(_this.overlayMapStyle){
      _this.overlayMapStyle.layers.forEach((layer) => {
        if(layer.metadata && 
          (layer.metadata['maphubs:interactive'] 
            || (layer.metadata['maphubs:markers'] && 
                layer.metadata['maphubs:markers'].enabled
                )
          ) &&
          (layer.id.startsWith('omh') || layer.id.startsWith('osm'))
        ){
          let source = _this.overlayMapStyle.sources[layer.source];
          
          const sourceId = layer.source;
          if(!_includes(sourceIDs, sourceId)){
            if(source.metadata && source.metadata['maphubs:presets']){
              let filter = ['any'];
              let presets = source.metadata['maphubs:presets'];
              presets.forEach(preset=>{
                if(preset.type === 'text'){
                  filter.push(['~=', preset.tag, query]);
                }                
              });
              queries.push({source: sourceId, filter});
            }else{
              debug.log('presets not found for source: ' + layer.source);
            }
            sourceIDs.push(sourceId);
          }               
        }
      });
    }
    return queries;
  },

  onSearch(queryText: string){
    var _this = this;

    //clear prev display layers
    this.onSearchReset();

    var results = {
      bbox: [],
      geoJSON: {type: 'FeatureCollection', features: []},
      list: []
    };

    let searchDisplayLayers = [];

    this.getSearchFilters(queryText).forEach(query => {
      let queryResults = MapboxGLRegexSearch.querySourceFeatures(
        query.source,   
        {
          sourceLayer: 'data',
          filter: query.filter
        },
        _this.map);

        let source = _this.overlayMapStyle.sources[query.source];
        
        

        
        let presets = source.metadata['maphubs:presets'];
        let nameFieldPreset = _find(presets, {isName: true});
        let nameField; 
        if(nameFieldPreset){
          nameField = nameFieldPreset.tag;
        }

        if(!nameField){
          let matchNameArr = [];
          if(presets && presets.length > 0){
             presets.forEach(preset =>{
              if(preset && preset.label ){
                let label = _this._o_(preset.label).toString();
                if(label.match(/.*[N,n]ame.*/g)){
                  matchNameArr.push(preset.tag);
                }
              }
              });
             if(matchNameArr.length > 0){
              //found something that matches Name
              nameField = matchNameArr[0];
            }else{
              //otherwise just take the first preset
              nameField = presets[0].tag;
            }
          }else if(queryResults.length > 0){
            //use props of first feature
            let propNames = Object.keys(queryResults[0].properties);
            propNames.forEach(propName =>{
            if(propName.match(/.*[N,n]ame.*/g)){
              matchNameArr.push(propName);
            }
            });
            if(matchNameArr.length > 0){
              //found something that matches Name
              nameField = matchNameArr[0];
            }else{
              //otherwise just take the first prop
              nameField = propNames[0];
            }
          }
        }

        let mhids = [];
        queryResults.forEach(result => {
          let name = result.properties[nameField];
          let data = {
            id: result.properties.mhid,
            name,
            geoJSON: result,
            source: query.source
          };
          if(result.properties.mhid){
            //dedupe by mhid since mapbox-gl can return duplicates
            if(!_includes(mhids, result.properties.mhid)){
              results.list.push(data);
              mhids.push(result.properties.mhid);
            }
          }else{
            //otherwise just add everything
            data.id = uuid();
            results.list.push(data);
          } 
          results.geoJSON.features.push(result);
        });

        //set display layers
        if(queryResults && queryResults.length > 0){
          searchDisplayLayers = searchDisplayLayers.concat(_this.getSearchDisplayLayers(query.source, source, mhids));
        }
     
    });

    //calculate bounds of results
    if(results.list.length > 0){
      //getting a weird effect from larger polygon layers if they are zoomed inside of their boundaries
      if(_this.map.getZoom() < 10){
        let bbox =  _bbox(results.geoJSON);
        _this.map.fitBounds(bbox, {padding: 25, curve: 3, speed:0.6, maxZoom: 16});
        results.bbox = bbox;
      }    
    }
    
    this.searchDisplayLayers = searchDisplayLayers;
    var firstLabelLayer = _this.getFirstLabelLayer();
    searchDisplayLayers.forEach(layer => {
      _this.map.addLayer(layer, firstLabelLayer);
    });

    debug.log(results);
    return results;
    
  },

  onSearchResultClick(result: Object){
    if(result.bbox){
      this.map.fitBounds(result.bbox, {padding: 25, curve: 3, speed:0.6, maxZoom: 16});
    }else if(result._geometry || result.geometry){
      let geometry = result._geometry ? result._geometry : result.geometry;
      if(geometry.type === 'Point'){
         this.map.flyTo({center: geometry.coordinates});
      }else{
         let bbox =  _bbox(geometry);
         this.map.fitBounds(bbox, {padding: 25, curve: 3, speed:0.6, maxZoom: 22});
      }  
    }  
  },

  onSearchReset() {
    var _this = this;
    if(this.searchDisplayLayers && this.searchDisplayLayers.length > 0){
      this.searchDisplayLayers.forEach(layer => {
        _this.map.removeLayer(layer.id);
      });
    }
  },
  

  getSearchDisplayLayers(sourceID: string, source: GLSource, mhids: Array<string>): Array<GLLayer>{
    const searchLayerColor = 'yellow';
    const mhidFilter = ["in", "mhid"].concat(mhids);
    return [
      {
        "id": `omh-search-result-point-${sourceID}`,
        "type": "circle",
        "source": sourceID,
        "source-layer": source.type === 'geojson' ? '' : 'data',
        "filter": [ "all",
          ["in", "$type", "Point"],
          mhidFilter
        ],
        "paint": {
          "circle-radius": 15,
          "circle-color": searchLayerColor,
          "circle-opacity": 0.5
        }
      },
      {
        "id": `omh-search-result-line-${sourceID}`,
        "type": "line",
        "source": sourceID,
        "source-layer": source.type === 'geojson' ? '' : 'data',
        "filter": [ "all",
          ["in", "$type", "LineString"],
          mhidFilter
        ],
        "paint": {
          "line-color": searchLayerColor,
          "line-opacity": 0.3,
          "line-width": 1
        }
      },
      {
      "id": `omh-search-result-polygon-${sourceID}`,
      "type": "fill",
      "source": sourceID,
      "source-layer": source.type === 'geojson' ? '' : 'data',
      "filter": [ "all",
          ["in", "$type", "Polygon"],
          mhidFilter
        ],
      "paint": {
        "fill-color": searchLayerColor,
        "fill-outline-color": 'black',
        "fill-opacity": 0.7
      }
    }
    ];
  }

};