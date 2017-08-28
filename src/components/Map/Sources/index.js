module.exports = {
  getSource(key, source){
    var response = function(driver: Function, custom: boolean = false){
      return {
        key,
        source,
        custom,
        driver
      };
    };
    if(
      !key.startsWith('osm') && 
      source.type === 'vector' && 
      (!source.url || !source.url.startsWith('mapbox://')) 
    ){
      return response(this['maphubs-vector']);
    }else if(
      source.type === 'geojson' && 
      source.data
    ){
       return response(this['maphubs-vector']);
    }else if(
      source.type === 'arcgisraster'
    ){
      return response(this['arcgisraster'], true);
      
    }else if(
      this[source.type] && 
      this[source.type].addLayer
    ){
      //use custom driver for this source type
      return response(this[source.type]);
    }else{
      return response(this['generic']);
    }
  },
  'arcgisraster': require('./AGSRaster'),
  'ags-mapserver-query': require('./AGSMapServerQuery'),
  'ags-featureserver-query': require('./AGSFeatureServerQuery'),
  'mapbox-style': require('./MapboxSource'),
  'maphubs-vector': require('./MapHubsSource'),
  'raster': require('./RasterSource'),
  'generic': require('./GenericSource')
};