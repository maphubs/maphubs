var Reflux = require('reflux');

var actions = Reflux.createActions({
  'loadLayer': {},
  'saveSettings': {},
  'saveDataSettings': {},
  'saveStyle': {},
  'loadData': {},
  'initEmptyLayer': {},
  'deleteData': {},
  'deleteLayer': {},
  'cancelLayer': {},
  'createLayer': {},
  'setStyle': {},
  'dataLoaded': {},
  'tileServiceInitialized': {},
  'setDataType': {},
  'resetStyle': {},
  'setComplete': {},
  'finishUpload': {}
});

module.exports = actions;
