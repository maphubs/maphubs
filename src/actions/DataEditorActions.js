var Reflux = require('reflux');

var actions = Reflux.createActions({
  
  'saveEdits': {},
  'startEditing': {},
  'stopEditing': {},
  'selectFeature': {},
  'resetEdits': {},
  'undoEdit': {},
  'redoEdit': {},
  'updateSelectedFeatureTags': {},
  'updateFeatures': {},
  'onFeatureUpdate': {},
  'createFeature': {},
  'deleteFeature': {}

});

module.exports = actions;
