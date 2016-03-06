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
