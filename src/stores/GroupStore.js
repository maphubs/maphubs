var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/GroupActions');
var request = require('superagent');
var debug = require('../services/debug')('stores/group-store');
var checkClientError = require('../services/client-error-response').checkClientError;

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,


  getInitialState() {
    return  {
      group: {},
      members: [],
      layers: []
    };
  },

  reset(){
    this.setState(this.getInitialState());
  },

  storeDidUpdate(){
    debug('store updated');
  },

 //listeners

 loadGroup(group){
   debug('load group');
   this.setState({group});
 },

 loadMembers(members){
   debug('load members');
   this.setState({members});
 },

 createGroup(group_id, name, description, location, published, _csrf, cb){
   debug('create group');
   var _this = this;

   request.post('/api/group/create')
   .type('json').accept('json')
   .send({
     group_id,
     name,
     description,
     location,
     published,
     _csrf
   })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       var group = {
         group_id,
         name,
         description,
         location,
         published,
         created: true,
         hasImage: false
       };
       _this.setState({group});
       _this.trigger(_this.state);
       cb();
     });
   });
 },
 updateGroup(group_id, name, description, location, published, _csrf, cb){
   debug('update group');
   var _this = this;
   request.post('/api/group/save')
   .type('json').accept('json')
   .send({
     group_id,
     name,
     description,
     location,
     published,
     _csrf
   })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       var group = {
         group_id,
         name,
         description,
         location,
         published,
         created: true
       };
       _this.setState({group});
       _this.trigger(_this.state);
       cb();
     });
   });
 },
 deleteGroup(_csrf, cb){
   var _this = this;
   debug('delete group');
   request.post('/api/group/delete')
   .type('json').accept('json')
   .send({
     group_id: this.state.group.group_id,
    _csrf
  })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       _this.setState({group: {}});
       _this.trigger(_this.state);
       cb();
     });
   });
 },

 setGroupImage(data, _csrf, cb){
   debug('set group image');
   var _this = this;

   request.post('/api/group/setphoto')
   .type('json').accept('json')
   .send({
     group_id: this.state.group.group_id,
     image: data,
     _csrf
    })
   .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
         var group = _this.state.group;
         group.hasImage = true;
         _this.setState({group});
         _this.trigger(_this.state);
         cb();
     });
   });
 },
 addMember(display_name, asAdmin, _csrf, cb){
   debug('add member');
   var _this = this;
   request.post('/api/group/addmember')
   .type('json').accept('json')
   .send({
     group_id: this.state.group.group_id,
     display_name,
     asAdmin,
     _csrf
    })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
        _this.reloadMembers(_csrf, cb);
     });
   });
 },
 removeMember(user_id, _csrf, cb){
   debug('remove member');
   var _this = this;
   request.post('/api/group/removemember')
   .type('json').accept('json')
   .send({
     group_id: this.state.group.group_id,
     user_id,
     _csrf
    })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
        _this.reloadMembers(_csrf, cb);
     });
   });
 },
 setMemberAdmin(user_id, _csrf, cb){
   debug('set member admin');
   var _this = this;
   request.post('/api/group/updatememberrole')
   .type('json').accept('json')
   .send({
     group_id: this.state.group.group_id,
     user_id,
     role: 'Administrator',
     _csrf
    })
   .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        _this.reloadMembers(_csrf, cb);
     });
   });
 },
 removeMemberAdmin(user_id, _csrf, cb){
   debug('remove member admin');
   var _this = this;
   request.post('/api/group/updatememberrole')
   .type('json').accept('json')
   .send({
     group_id: this.state.group.group_id,
     user_id,
     role: 'Member',
     _csrf
    })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
         _this.reloadMembers(_csrf, cb);
     });
   });
 },

 reloadMembers(_csrf, cb){
   debug('reload members');
   var _this = this;
   request.post('/api/group/' + this.state.group.group_id + '/members')
   .type('json').accept('json')
   .send({_csrf})
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       _this.loadMembers(res.body.members);
       cb();
     });
   });
 }

});
