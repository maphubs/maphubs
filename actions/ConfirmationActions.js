var Reflux = require('reflux');

var actions = Reflux.createActions({
  'showConfirmation': {},
  'positiveResponse': {},
  'negativeResponse': {}
});

module.exports = actions;
