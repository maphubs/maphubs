var Reflux = require('reflux');

var actions = Reflux.createActions({
  'loadHub': {},
  'updateLayers': {},
  'createHub': {},
  'saveHub': {},
  'setTitle' : {},
  'setTagline' : {},
  'setDescription' : {},
  'setResources' : {},
  'setAbout' : {},
  'setHubLogoImage': {},
  'setHubBannerImage': {},
  'setMap': {},
  'deleteHub': {},
  'publish': {}
});

module.exports = actions;
