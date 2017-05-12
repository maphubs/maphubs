// @flow
var passport = require('passport');
var local = require('../local');
var request = require("request");
var AuthUsers = require('./auth-db/users');
var _find = require('lodash.find');
var User = require('../models/user');

if(local.useLocalAuth){
  var  LocalStrategy = require('passport-local').Strategy;  
  var PasswordUtil = require('./password-util');

  /**
   * LocalStrategy
   *
   * This strategy is used to authenticate users based on a username and password.
   * Anytime a request is made to authorize an application, we must ensure that
   * a user is logged in before asking them to approve the request.
   */
  passport.use(new LocalStrategy(
    (username, password, done) => {
      AuthUsers.findByUsername(username, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (!user) {
          return done(null, false);
        }
        //check password against hash from database
        PasswordUtil.checkPassword(user.id, password, (valid) => {
          if(valid){
            return done(null, user);
          }else{
            return done(null, false);
          }
        });
      });
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    AuthUsers.find(user.id, (err, user) => {
      done(err, user);
    });
  });

}else{

  var Auth0Helper = require('../services/auth0-helper');

  var saveMapHubsIDToAuth0 = function(profile, maphubs_user_id, cb){
    var hosts = [];
    if(profile._json.app_metadata && profile._json.app_metadata.hosts){
      hosts = profile._json.app_metadata.hosts;
    }

    hosts.push({host: local.host, user_id: maphubs_user_id});
    Auth0Helper.getManagementToken((err, accessToken) => {
      if (err) {
        cb(err);
      }
      var options = { 
        method: 'PATCH',
        url: `https://${local.AUTH0_DOMAIN}/api/v2/users/${profile.id}`,
        headers: { 
          'content-type': 'application/json',
          authorization: 'Bearer ' +  accessToken
        },
        body: {app_metadata: {hosts}},
        json: true
      };

      request(options, (error, reponse, body) => {
        cb(error);
      });
    });
    
  };

  var Auth0Strategy = require('passport-auth0');
  // Configure Passport to use Auth0
  var strategy = new Auth0Strategy({
      domain:       local.AUTH0_DOMAIN,
      clientID:     local.AUTH0_CLIENT_ID,
      clientSecret: local.AUTH0_CLIENT_SECRET,
      callbackURL:  local.AUTH0_CALLBACK_URL || 'http://maphubs.dev:4000/callback'
    }, (accessToken, refreshToken, extraParams, profile, done) => {
      // accessToken is the token to call Auth0 API (not needed in the most cases)
      // extraParams.id_token has the JSON Web Token
      // profile has all the information from the user
       
       //check if user has a local user object
       var hosts = [];

       if(profile._json.app_metadata && 
          profile._json.app_metadata.hosts){
            hosts =  profile._json.app_metadata.hosts;
        }
  
        var host = _find(hosts, {host: local.host});
        if(host && host.user_id){

            //local user already linked
            AuthUsers.find(host.user_id, (err, maphubsUser) => {
              if (err) {
                return done(err, false);
              }
              //attach MapHubs User
              profile.maphubsUser = maphubsUser;
              return done(err, profile);
            });
        }else {
          //attempt to lookup user by email
          AuthUsers.findByEmail(profile._json.email, (err, maphubsUser) => {
            if (err) {
              return done(err, false);
            }
            if(maphubsUser){
              //found a user with this email, 
              //link it back to the Auth0 account
              saveMapHubsIDToAuth0(profile, maphubsUser.id, (err) =>{
                profile.maphubsUser = maphubsUser;
                return done(err, profile);
              });
              
            }else{
              //local user not found
              if(!local.requireInvite){
                //create local user
                var display_name = profile.displayName ? profile.displayName: profile._json.email;
                return User.createUser(profile._json.email, display_name, display_name, profile.id)
                .then((user_id) => {
                  saveMapHubsIDToAuth0(profile, user_id, (err) =>{
                    if (err) {
                      return done(err, false);
                    }
                    AuthUsers.find(user_id, (err, maphubsUser) => {
                      if (err) {
                        return done(err, false);
                      }
                      //attach MapHubs User
                      profile.maphubsUser = maphubsUser;
                      return done(err, profile);
                    });
                  });
                });
              }else{
                return done(new Error('Unauthorized Access'), false);
              }
            }
          });
        }
     
    });

  passport.use(strategy);

  // This can be used to keep a smaller payload
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

}

  



