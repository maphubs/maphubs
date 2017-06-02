//@flow
var MapboxGLRegexSearch = require('mapbox-gl-regex-query');
var _includes = require('lodash.includes');
var debug = require('../../../services/debug')('MapSearchMixin');

export default function() {
  var _this = this;

  this.getSearchFilters = (query: string) => {
    query = `/.*${query}.*/g`;
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
                filter.push(['~=', preset.tag, query]);
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
  };

  this.onSearch = (queryText: string) => {
    var results = [];
    this.getSearchFilters(queryText).forEach(query => {
      let queryResults = MapboxGLRegexSearch.querySourceFeatures(
        query.source,   
        {
          sourceLayer: 'data',
          filter: query.filter
        },
        _this.map);
      results = results.concat(queryResults);
    });

    //var results = MapboxGLRegexSearch.querySourceFeatures('omh-33', 
    //{
     // sourceLayer: 'data',
     // filter: ['all',
      //  ['~=', 'NAME_0', '/.*Demo.*/g'],
      //  ['~=', 'NAME_1', '/.*undu.*/g']
     // ]
    //},_this.map);
    //Dedupe larger features that cross tiles may return duplicates

    debug(results);
    
  };
  

}