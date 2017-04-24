import Reflux from 'reflux';
import Actions from '../actions/HubActions';
var request = require('superagent');
var debug = require('../services/debug')('stores/hub-store');
var checkClientError = require('../services/client-error-response').checkClientError;


export default class HubStore extends Reflux.Store {

  constructor(){
    super();
    this.state = this.getDefaultState();
    this.listenables = Actions;
  }

  getDefaultState(){
    return {
      hub: {},
      map: null,
      layers: [],
      logoImage: null,
      bannerImage: null,
      logoImageInfo: null,
      bannerImageInfo: null,
      hasLogoImage: false,
      hasBannerImage: false,
      unsavedChanges: false,
      saving: false
    };
  }

  reset(){
    this.setState(this.getDefaultState());
  }

  storeDidUpdate(){
    debug('store updated');
  }

 //listeners

 loadHub(hub){
   debug('load hub');
   this.setState({hub});
 }

 createHub(hub_id, group_id, name, published, isPrivate, _csrf, cb){
   debug('create hub');
   var _this = this;

   request.post('/api/hub/create')
   .type('json').accept('json')
   .send({
     hub_id,
     group_id,
     name,
     published,
     private: isPrivate,
     _csrf
   })
   .end((err, res) => {
     checkClientError(res, err, cb, (cb) => {
       var hub = {
         hub_id,
         name,
         published
       };
       _this.setState({hub});
       _this.trigger(_this.state);
       cb(null);
     });
   });
 }

 saveHub(_csrf, cb){
   debug('save hub');
   var _this = this;

   var baseUrl = '/hub/' + this.state.hub.hub_id;

   this.setState({saving: true});
   request.post(baseUrl + '/api/save')
   .type('json').accept('json')
   .send({
     hub_id: this.state.hub.hub_id,
     name: this.state.hub.name,
     description: this.state.hub.description,
     tagline: this.state.hub.tagline,
     resources: this.state.hub.resources,
     about: this.state.hub.about,
     published: this.state.hub.published,
     map_id: this.state.hub.map_id,
     logoImage: this.state.logoImage,
     logoImageInfo: this.state.logoImageInfo,
     bannerImage: this.state.bannerImage,
    bannerImageInfo: this.state.bannerImageInfo,
    _csrf

   })
   .end((err, res) => {
     checkClientError(res, err, cb, (cb) => {
       _this.setState({saving: false, unsavedChanges: false});
       cb(null);
     });
   });
 }

 setPrivate(isPrivate, _csrf, cb){
    var _this = this;
    debug('hub privacy');
    var baseUrl = '/hub/' + this.state.hub.hub_id;
    request.post(baseUrl + '/api/privacy')
    .type('json').accept('json')
    .send({
        hub_id: this.state.hub.hub_id,
        private: isPrivate,
        _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        var hub = _this.state.hub;
        hub.private = isPrivate;
        _this.setState({hub});
        cb();
      });
    });
  }

  transferOwnership(to_group_id, _csrf, cb){
    var _this = this;
    debug('hub privacy');
    var baseUrl = '/hub/' + this.state.hub.hub_id;
    request.post(baseUrl + '/api/transfer')
    .type('json').accept('json')
    .send({
        hub_id: this.state.hub.hub_id,
        group_id: to_group_id,
        _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
         var hub = _this.state.hub;
         hub.owned_by_group_id = to_group_id;
        _this.setState({hub});
        cb();
      });
    });
  }

 deleteHub(_csrf, cb){
   var _this = this;
   debug('delete hub');
   var baseUrl = '/hub/' + this.state.hub.hub_id;

   request.post(baseUrl + '/api/delete')
   .type('json').accept('json')
   .send({hub_id: this.state.hub.hub_id, _csrf})
   .end((err, res) => {
     checkClientError(res, err, cb, (cb) => {
       _this.setState({hub: {}});
       _this.trigger(_this.state);
       cb(null);
     });
   });
 }

 setMap(map){
   var hub = this.state.hub;
   hub.map_id = map.map_id;
   this.setState({hub, map, unsavedChanges: true});
 }

 setHubLogoImage(data, info){
    var hub = this.state.hub;
    hub.hasLogoImage = true;
   this.setState({logoImage: data, logoImageInfo: info, unsavedChanges: true, hub});
 }

 setHubBannerImage(data, info){
   var hub = this.state.hub;
    hub.hasBannerImage = true;
   this.setState({bannerImage: data, bannerImageInfo: info, unsavedChanges: true, hub});
 }

 setTitle(title){
   var hub = this.state.hub;
   hub.name = title;
   this.setState({hub, unsavedChanges: true});
 }

  publish(_csrf, cb){
   var hub = this.state.hub;
   hub.published = true;
   this.setState({hub, unsavedChanges: true});
   this.trigger(this.state);
   this.saveHub(_csrf, cb);
 }

 setTagline(tagline){
   var hub = this.state.hub;
   hub.tagline = tagline;
   this.setState({hub, unsavedChanges: true});
 }

 setDescription(description){
   var hub = this.state.hub;
   hub.description = description;
   this.setState({hub, unsavedChanges: true});
 }

 setResources(resources){
   var hub = this.state.hub;
   hub.resources = resources;
   this.setState({hub, unsavedChanges: true});
 }

 setAbout(about){
   var hub = this.state.hub;
   hub.about = about;
   this.setState({hub, unsavedChanges: true});
 }
}