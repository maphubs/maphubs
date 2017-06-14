//@flow
import Reflux from 'reflux';
import Actions from '../actions/GroupActions';
var request = require('superagent');
var debug = require('../services/debug')('stores/group-store');
var checkClientError = require('../services/client-error-response').checkClientError;

export type Group = {
  group_id?: string, 
  name?: LocalizedString, 
  description?: LocalizedString,
  location?: string,
  created?: boolean,
  hasImage?: boolean
}

export type GroupStoreState = {
  group: Group,
  members: Array<Object>,
  layers?: Array<Object>
}

export default class GroupStore extends Reflux.Store {

  state: GroupStoreState

  constructor(){
    super();
    this.state = {
      group: {
        group_id: ''
      },
      members: [],
      layers: []
    };
    this.listenables = Actions;
  }

  reset(){
    this.setState({
      group: {},
      members: [],
      layers: []
    });
  }

  storeDidUpdate(){
    debug('store updated');
  }

 //listeners

 loadGroup(group: Object){
   debug('load group');
   this.setState({group});
 }

 loadMembers(members: Array<Object>){
   debug('load members');
   this.setState({members});
 }

 createGroup(group_id: string, name: string, description: string, location: string, published: boolean, _csrf: string, cb: Function){
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
   .end((err, res) => {
     checkClientError(res, err, cb, (cb) => {
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
 }

 updateGroup(group_id: string, name: string, description: string, location: string, published: boolean, _csrf: string, cb: Function){
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
   .end((err, res) => {
     checkClientError(res, err, cb, (cb) => {
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
 }

 deleteGroup(_csrf: string, cb: Function){
   var _this = this;
   debug('delete group');
   request.post('/api/group/delete')
   .type('json').accept('json')
   .send({
     group_id: this.state.group.group_id,
    _csrf
  })
   .end((err, res) => {
     checkClientError(res, err, cb, (cb) => {
       _this.setState({group: {}});
       _this.trigger(_this.state);
       cb();
     });
   });
 }

 setGroupImage(data: Object, _csrf: string, cb: Function){
   debug('set group image');
   var _this = this;

   request.post('/api/group/setphoto')
   .type('json').accept('json')
   .send({
     group_id: this.state.group.group_id,
     image: data,
     _csrf
    })
   .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
         var group = _this.state.group;
         group.hasImage = true;
         _this.setState({group});
         _this.trigger(_this.state);
         cb();
     });
   });
 }

 addMember(display_name: string, asAdmin: boolean, _csrf: string, cb: Function){
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
   .end((err, res) => {
     checkClientError(res, err, cb, (cb) => {
        _this.reloadMembers(_csrf, cb);
     });
   });
 }

 removeMember(user_id: number, _csrf: string, cb: Function){
   debug('remove member');
   var _this = this;
   request.post('/api/group/removemember')
   .type('json').accept('json')
   .send({
     group_id: this.state.group.group_id,
     user_id,
     _csrf
    })
   .end((err, res) => {
     checkClientError(res, err, cb, (cb) => {
        _this.reloadMembers(_csrf, cb);
     });
   });
 }

 setMemberAdmin(user_id: number, _csrf: string, cb: Function){
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
   .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        _this.reloadMembers(_csrf, cb);
     });
   });
 }

 removeMemberAdmin(user_id: number, _csrf: string, cb: Function){
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
   .end((err, res) => {
     checkClientError(res, err, cb, (cb) => {
         _this.reloadMembers(_csrf, cb);
     });
   });
 }

 reloadMembers(_csrf: string, cb: Function){
   debug('reload members');
   var _this = this;
   var group_id = this.state.group.group_id? this.state.group.group_id : '';
   request.post('/api/group/' + group_id + '/members')
   .type('json').accept('json')
   .send({_csrf})
   .end((err, res) => {
     checkClientError(res, err, cb, (cb) => {
       _this.loadMembers(res.body.members);
       cb();
     });
   });
 }
}