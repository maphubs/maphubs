var Reflux = require('reflux');

var actions = Reflux.createActions({
  'setSearchLayers': {},
  'setMapLayers': {},
  'setMapId': {},
  'setStoryId': {},
  'setHubId': {},
  'search': {},
  'addToMap': {},
  'removeFromMap': {},
  'updateLayerStyle': {},
  'setMapTitle': {},
  'setMapPosition': {},
  'setMapBasemap': {},
  'setPrivate': {},
  'savePrivate': {},
  'setOwnedByGroupId': {},
  'saveMap': {},
  'createMap': {},
  'toggleVisibility': {},
  'reset': {},
  'deleteMap': {},
  'startEditing': {},
  'stopEditing': {}
});

module.exports = actions;
