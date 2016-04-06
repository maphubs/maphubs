var Reflux = require('reflux');

var actions = Reflux.createActions({
  'showConfirmation': {},
  'positiveResponse': {},
  'negativeResponse': {},
  'reset': {}
});

module.exports = actions;
