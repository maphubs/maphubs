var Reflux = require('reflux');

var actions = Reflux.createActions({
  'loadLayer': {},
  'saveSettings': {},
  'saveSource': {},
  'saveDataSettings': {},
  'saveStyle': {},
  'loadData': {},
  'deleteData': {},
  'deleteLayer': {},
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
