
//var debug = require('./debug')('geojson-utils');
module.exports = {

  convertTagsToProps(features){
    features.forEach((feature) => {
      const tags = feature.properties.tags;
      if(tags){
          Object.keys(tags).map((key) => {
            const val = tags[key];
            feature.properties[key] = val;
          });
          delete feature.properties.tags;
        }
    });
    return features;
  }

};
