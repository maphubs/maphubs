var Reflux = require('reflux');

var actions = Reflux.createActions({
  'setImportedTags': {},
  'setTagMapping': {},
  'presetsChanged': {},
  'submitPresets': {},
  'addPreset': {},
  'deletePreset': {},
  'updatePreset': {},
  'setLayerId': {},
  'loadPresets': {},
  'loadDefaultPresets': {}  
});

module.exports = actions;
