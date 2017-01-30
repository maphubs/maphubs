var Reflux = require('reflux');

var actions = Reflux.createActions({
  'loadHub': {},
  'loadMembers': {},
  'loadLayers': {},
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
  'addMember': {},
  'removeMember': {},
  'setMemberAdmin': {},
  'removeMemberAdmin': {},
  'setMap': {},
  'deleteHub': {},
  'publish': {},
  'moveUp': {},
  'moveDown': {},
  'toggleVisibility': {}
});

module.exports = actions;
