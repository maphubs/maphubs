var Reflux = require('reflux');

var actions = Reflux.createActions({
  'addMarker': {},
  'removeMarker': {},
  'removeLayer': {},
  'getMarker': {}
});

module.exports = actions;
