var Reflux = require('reflux');

var actions = Reflux.createActions({
  'toggleBaseMaps': {},
  'closeBaseMaps': {},
  'toggleEditBaseMap': {},
  'closeEditBaseMap': {},
  'changeBaseMap': {},
  'getBaseMapFromName': {},
  'setBaseMap': {}
});

module.exports = actions;
