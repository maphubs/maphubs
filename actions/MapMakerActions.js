var Reflux = require('reflux');

var actions = Reflux.createActions({
  'setSearchLayers': {},
  'setMapLayers': {},
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
  'saveMap': {},
  'createUserMap': {},
  'createStoryMap': {},
  'toggleVisibility': {},
  'reset': {},
  'deleteMap': {}
});

module.exports = actions;
