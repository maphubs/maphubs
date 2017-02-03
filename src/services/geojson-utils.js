

module.exports = {

  convertTagsToProps(features){
    features.forEach(function(feature) {
      var tags = feature.properties.tags;
      if(tags){
        tags = tags.replace(/\r?\n/g, ' ');
        tags = JSON.parse(tags);
        if(tags){
          Object.keys(tags).map(function(key) {
            var val = tags[key];
            feature.properties[key] = val;
          });
          delete feature.properties.tags;
        }
      }
    });
    return features;
  }

};
