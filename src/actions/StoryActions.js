var Reflux = require('reflux');

var actions = Reflux.createActions({
  'save': {},
  'delete': {},
  'addImage': {},
  'removeImage': {},
  'handleBodyChange': {},
  'handleTitleChange': {},
  'handleAuthorChange': {},
  'publish': {}
});

module.exports = actions;
