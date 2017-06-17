//@flow
var MapboxGLRegexSearch = require('mapbox-gl-regex-query/dist/mapbox-gl-regex-query-dev');
var _includes = require('lodash.includes');
var debug = require('../../../services/debug')('MapSearchMixin');
var _find = require('lodash.find');
var _bbox = require('@turf/bbox');
var uuid = require('uuid').v1;

export default function() {
  var _this = this;

  this.getSearchFilters = (query: string) => {
    query = `/.*${query}.*/ig`;
    let sourceIDs = [];
    let queries = [];
    if(_this.state.glStyle){
      _this.state.glStyle.layers.forEach((layer) => {
        if(layer.metadata && layer.metadata['maphubs:interactive'] &&
          (layer.id.startsWith('omh') || layer.id.startsWith('osm'))
        ){
          let source = _this.state.glStyle.sources[layer.source];
          
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
              debug('presets not found for source: ' + layer.source);
            }
            sourceIDs.push(sourceId);
          }               
        }
      });
    }
    return queries;
  };

  this.onSearch = (queryText: string) => {
    var _this = this;
    var results = {
      bbox: [],
      geoJSON: {type: 'FeatureCollection', features: []},
      list: []
    };
    this.getSearchFilters(queryText).forEach(query => {
      let queryResults = MapboxGLRegexSearch.querySourceFeatures(
        query.source,   
        {
          sourceLayer: 'data',
          filter: query.filter
        },
        _this.map);

        let source = _this.state.glStyle.sources[query.source];
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
    

    //TODO: add display layer to map

    debug(results);
    return results;
    
  };

  this.onSearchResultClick = (result: Object) => {
    if(result.bbox){
      _this.map.fitBounds(result.bbox, {padding: 25, curve: 3, speed:0.6, maxZoom: 16});
    }else{
      let bbox =  _bbox(result);
      //let bounds = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
      _this.map.fitBounds(bbox, {padding: 25, curve: 3, speed:0.6, maxZoom: 16});
    }  
  };

  this.onSearchReset = () => {
    //TODO: remove display layer from map
  };

}