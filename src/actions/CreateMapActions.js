var Reflux = require('reflux');

var actions = Reflux.createActions({
  'setSearchLayers': {},
  'setMapLayers': {},
  'reloadSearchLayersHub': {},
  'setMapId': {},
  'setStoryId': {},
  'setHubId': {},
  'search': {},
  'addToMap': {},
  'editMap': {},
  'removeFromMap': {},
  'moveUp': {},
  'moveDown': {},
  'updateLayerStyle': {},
  'setMapTitle': {},
  'setMapPosition': {},
  'setMapBasemap': {},
  'showMapDesigner': {},
  'closeMapDesigner': {},
  'toggleVisibility': {},
  'reset': {}
});

module.exports = actions;
