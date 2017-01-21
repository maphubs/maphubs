var Reflux = require('reflux');

var actions = Reflux.createActions({
  'toggleBaseMaps': {},
  'closeBaseMaps': {},
  'toggleEditBaseMap': {},
  'closeEditBaseMap': {},
  'changeBaseMap': {},
  'getBaseMapFromName': {},
  'setBaseMap': {},
  'updateMapPosition': {}
});

module.exports = actions;
