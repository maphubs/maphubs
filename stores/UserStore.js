var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/UserActions');
var request = require('superagent');
var debug = require('../services/debug')('stores/user-store');
var checkClientError = require('../services/client-error-response').checkClientError;

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return  {
      user: {},
      loggedIn: false
    };
  },

  reset(){
    this.setState(this.getInitialState());
  },

  storeDidUpdate(){
    debug('store updated');
  },

 //listeners
 login(user){
   this.setState({user, loggedIn: true});
 },

 getUser(cb){
   var _this = this;
   request.post('/api/user/details/json')
   .type('json').accept('json')
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       if (err) {
         cb(err);
       }else{
         if(res.body && res.body.loggedIn){
           _this.login(res.body.user);
           cb();
         }else{
           cb(JSON.stringify(res.body));
         }
       }
     });
   });
 },

 logout(){
   this.setState(this.getInitialState());
   this.trigger(this.state);
   //Note the server side is handed by redirecting the user to the logout page
 },

 register(){

 },

  updatePassword(user_id, password, pass_reset, _csrf, cb){
    if(this.state.loggedIn && this.state.user.id !== user_id){
      debug('User ID mismatch, will not send request');
      cb('User session error, please clear browser sessions/cache and try again.');
      //Note: the server endpoint will also check the user_id against the active session, this is just an additional check on the client side
      return;
    } else if(!this.state.loggedIn  && !pass_reset){
      debug('Pass reset key not found');
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
      .end(function(err, res){
        checkClientError(res, err, cb, function(cb){
            cb(err);
        });
      });
    }


  },

  forgotPassword(email, _csrf, cb){
    request.post('/api/user/forgotpassword')
    .type('json').accept('json')
    .send({
      email //user_id to reset
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
          cb(err);
      });
    });
  },

  signup(username, name, email, password, joinmailinglist, inviteKey, _csrf, cb){
    request.post('/api/user/signup')
    .type('json').accept('json')
    .send({
      username,
      name,
      email,
      password,
      joinmailinglist,
      inviteKey
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
          cb(err);
      });
    });
  },

  joinMailingList(email, _csrf, cb){
    request.post('/api/user/mailinglistsignup')
    .type('json').accept('json')
    .send({email, _csrf})
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
          cb(err);
      });
    });
  },

  resendConfirmation(_csrf, cb){
    request.post('/api/user/resendconfirmation')
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
          cb(err);
      });
    });
  },

  checkUserNameAvailable(username){

    //not used yet since react-formsy can't support async on validation functions...
    /*
    request.post('/api/user/checkusernameavailable')
    .type('json').accept('json')
    .send({
      username //user_id to reset
    })
    .end(function(err, res){
      if (err) {
        cb(JSON.stringify(err), false);
      }else{
        if(res.body && res.body.success == true && res.body.available){
          cb(null, res.body.available);
        }else{
          cb(res.body, false);
        }
      }
    });
    */
  }

});
