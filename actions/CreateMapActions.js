var Reflux = require('reflux');

var actions = Reflux.createActions({
  'setSearchLayers': {},
  'setMapLayers': {},
  'reloadSearchLayersAll': {},
  'reloadSearchLayersUser': {},
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
  'saveMap': {},
  'createUserMap': {},
  'createStoryMap': {},
  'showMapDesigner': {},
  'closeMapDesigner': {},
  'toggleVisibility': {},
  'reset': {},
  'deleteMap': {}
});

module.exports = actions;
