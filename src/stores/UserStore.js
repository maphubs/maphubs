//@flow
import Reflux from 'reflux';
import Actions from '../actions/UserActions';
var request = require('superagent');
var debug = require('../services/debug')('stores/user-store');
var checkClientError = require('../services/client-error-response').checkClientError;

export type User = {
  id: number,
  email: string,
  display_name: string,
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

 register(){

 }

  updatePassword(user_id: number, password: string, pass_reset: string, _csrf: string, cb: Function){
    if(this.state.loggedIn && this.state.user.id !== user_id){
      debug.log('User ID mismatch, will not send request');
      cb('User session error, please clear browser sessions/cache and try again.');
      //Note: the server endpoint will also check the user_id against the active session, this is just an additional check on the client side
      return;
    } else if(!this.state.loggedIn  && !pass_reset){
      debug.log('Pass reset key not found');
      cb('User session error, please clear browser sessions/cache and try again.');
    }else {
      request.post('/api/user/updatepassword')
      .type('json').accept('json')
      .send({
        user_id, //user_id to update, must match the active user session
        password, //new password
        pass_reset, //if the user isn't logged in, the one-time code from the password reset email must be provided
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
            cb(err);
        });
      });
    }
  }

  forgotPassword(email: string, _csrf: string, cb: Function){
    request.post('/api/user/forgotpassword')
    .type('json').accept('json')
    .send({
      email, //user_id to reset
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
          cb(err);
      });
    });
  }

  signup(username: string, name: string, email: string, password: string, joinmailinglist: boolean, inviteKey: string, _csrf: string, cb: Function){
    request.post('/api/user/signup')
    .type('json').accept('json')
    .send({
      username,
      name,
      email,
      password,
      joinmailinglist,
      inviteKey,
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
          cb(err);
      });
    });
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

  resendConfirmation(_csrf: string, cb: Function){
    request.post('/api/user/resendconfirmation')
    .type('json').accept('json')
    .send({_csrf})
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
          cb(err);
      });
    });
  }
}
