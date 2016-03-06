var Reflux = require('reflux');

var actions = Reflux.createActions({
  'loadGroup': {},
  'loadMembers': {},
  'createGroup': {},
  'updateGroup': {},
  'setGroupImage': {},
  'addMember': {},
  'removeMember': {},
  'setMemberAdmin': {},
  'removeMemberAdmin': {},
  'deleteGroup': {}
});

module.exports = actions;
