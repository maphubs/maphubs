
//var debug = require('./debug')('geojson-utils');
module.exports = {

  convertTagsToProps(features){
    features.forEach(function(feature) {
      var tags = feature.properties.tags;
      if(tags){
          Object.keys(tags).map(function(key) {
            var val = tags[key];
            feature.properties[key] = val;
          });
          delete feature.properties.tags;
        }
    });
    return features;
  }

};
