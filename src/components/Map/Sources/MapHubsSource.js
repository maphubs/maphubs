var request = require('superagent-bluebird-promise');
var debug = require('../../../services/debug')('MapHubsSource');
var MapHubsSource = {
  load(key, source, map, mapComponent){
    //load as tilejson
    var url = source.url.replace('{MAPHUBS_DOMAIN}', MAPHUBS_CONFIG.tileServiceUrl);
    return request.get(url)
      .then(function(res) {
        var tileJSON = res.body;
        tileJSON.type = 'vector';

        map.on('source.load', function(e) {
          if (e.source.id === key && mapComponent.state.allowLayersToMoveMap) {
            debug('Zooming map extent of source: ' + e.source.id);
            map.fitBounds([[tileJSON.bounds[0], tileJSON.bounds[1]],
                            [tileJSON.bounds[2], tileJSON.bounds[3]]]);
          }
        });
        map.addSource(key, tileJSON);
      }, function(error) {
        debug('(' + mapComponent.state.id + ') ' +error);
      });
  }
};

module.exports = MapHubsSource;