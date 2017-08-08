//@flow
import Reflux from 'reflux';
import Actions from '../actions/UserActions';
var request = require('superagent');
var debug = require('../services/debug')('stores/user-store');
var checkClientError = require('../services/client-error-response').checkClientError;

export type User = {
  id?: number,
  email?: string,
  display_name?: string,
  picture?: string
}

export type UserStoreState = {
  user?: User,
  loggedIn?: boolean,
  loaded?: boolean
}

export default class UserStore extends Reflux.Store {

  constructor(){
    super();
    this.state = this.getDefaultState();
    this.listenables = Actions;
  }

  getDefaultState(): UserStoreState{
    return {
      user: {},
      loggedIn: false,
      loaded: false
    };
  }

  reset(){
    this.setState(this.getDefaultState());
  }

  storeDidUpdate(){
    debug.log('store updated');
  }

 //listeners
 login(user: string){
   this.setState({user, loggedIn: true, loaded: true});
 }

 getUser(cb: Function){
   var _this = this;
   request.post('/api/user/details/json')
   .type('json').accept('json')
   .end((err, res) => {
     checkClientError(res, err, cb, (cb) => {
       if (err) {
         cb(err);
       }else{
         if(res.body && res.body.loggedIn){
           _this.login(res.body.user);
           cb();
         }else{
           _this.setState({loaded: true});
           cb(JSON.stringify(res.body));
         }
       }
     });
   });
 }

 logout(){
   this.setState(this.getDefaultState());
   this.trigger(this.state);
   //Note the server side is handed by redirecting the user to the logout page
 }

  joinMailingList(email: string, _csrf: string, cb: Function){
    request.post('/api/user/mailinglistsignup')
    .type('json').accept('json')
    .send({email, _csrf})
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
          cb(err);
      });
    });
  }
}
