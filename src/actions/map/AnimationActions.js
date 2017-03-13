var Reflux = require('reflux');

var actions = Reflux.createActions({
  'play': {},
  'stop': {},
  'reset': {},
  'tick': {}
});

module.exports = actions;
