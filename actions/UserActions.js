var Reflux = require('reflux');

var actions = Reflux.createActions({
  'login': {},
  'logout': {},
  'register': {},
  'getUser': {},
  'updatePassword': {},
  'forgotPassword': {},
  'checkUserNameAvailable': {},
  'signup': {},
  'resendConfirmation': {},
  'joinMailingList': {}
});

module.exports = actions;
