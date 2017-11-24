// @flow
var passport = require('passport');
var local = require('../local');
var AuthUsers = require('./auth-db/users');
var _find = require('lodash.find');
var User = require('../models/user');
var Admin = require('../models/admin');
var Auth0Helper = require('../services/auth0-helper');
var Promise = require('bluebird');
var log = require('./log');
var shortid = require('shortid');

var saveMapHubsIDToAuth0 = async function(profile, maphubs_user_id){
  log.info(`saving maphubs id ${maphubs_user_id} to auth0 for host ${local.host}`);
  var hosts = [];
  if(profile._json.app_metadata && profile._json.app_metadata.hosts){
    hosts = profile._json.app_metadata.hosts;
  }

  hosts.push({host: local.host, user_id: maphubs_user_id});
  const accessToken = await Auth0Helper.getManagementToken();
  return Auth0Helper.updateAppMetadata({hosts}, accessToken, profile);
};

var determineLocalDisplayName = function(profile){
  let displayName;

  if(profile._json && profile._json.username){
    displayName =  profile._json.username;
  }else if(profile.nickname){
    displayName = profile.nickname;
  }else if(profile.displayName){
    displayName = profile.displayName;
  }else{
    displayName= shortid.generate();
  }

  return displayName;
};

var createMapHubsUser = async function(profile: Object){
  var display_name = determineLocalDisplayName(profile);
  
  const user_id = await User.createUser(profile._json.email, display_name, display_name, profile.id);
  log.info(`Created new MapHubs user ${display_name} with id ${user_id}`);
  await saveMapHubsIDToAuth0(profile, user_id);
  const maphubsUser = await AuthUsers.find(user_id);
  //attach MapHubs User
  profile.maphubsUser = {
    id: maphubsUser.id,
    display_name: maphubsUser.display_name,
    email: maphubsUser.email
  };
  return profile;
};

var Auth0Strategy = require('passport-auth0');

// Configure Passport to use Auth0
var strategy = new Auth0Strategy({
    domain:       local.AUTH0_DOMAIN,
    clientID:     local.AUTH0_CLIENT_ID,
    clientSecret: local.AUTH0_CLIENT_SECRET,
    callbackURL:  local.AUTH0_CALLBACK_URL || 'http://maphubs.test:4000/callback'
  }, (accessToken, refreshToken, extraParams, profile, done) => {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
      log.info('Auth0 login');
      //check if user has a local user object
      var hosts = [];

      if(profile._json.app_metadata && 
        profile._json.app_metadata.hosts){
          hosts =  profile._json.app_metadata.hosts;
      }

      var host = _find(hosts, {host: local.host});
      if(host && host.user_id){
        //local user already linked
        return AuthUsers.find(host.user_id).then(async (maphubsUser) => {
          if(maphubsUser.id !== '1' && local.requireInvite){
            const allowed = await Admin.checkInviteEmail(maphubsUser.email);
            if(!allowed){
              log.warn(`unauthorized user: ${maphubsUser.email}`);
              return false;
            }
          }
          //attach MapHubs User
          log.info(`Auth0 login successful for ${maphubsUser.id} ${maphubsUser.display_name} ${maphubsUser.email}`);
          profile.maphubsUser = {
            id: maphubsUser.id,
            display_name: maphubsUser.display_name,
            email: maphubsUser.email
          };
          return profile;
        }).asCallback(done);
      
      }else {
        log.warn(`local user not linked: ${profile._json.email}`);
        //attempt to lookup user by email
        return AuthUsers.findByEmail(profile._json.email)
        .then(async (maphubsUser) => {
          if(maphubsUser){
            if(maphubsUser.id !== '1' && local.requireInvite){
              const allowed = await Admin.checkInviteEmail(maphubsUser.email);
              if(!allowed){
                log.warn(`unauthorized user: ${maphubsUser.email}`);
                return false;
              }
            }
            //link it back to the Auth0 account
            return saveMapHubsIDToAuth0(profile, maphubsUser.id)
            .then(() =>{
                profile.maphubsUser = {
                id: maphubsUser.id,
                display_name: maphubsUser.display_name,
                email: maphubsUser.email
              };
              return profile;
            });       
          }else{
            //local user not found
            if(!local.requireInvite){
              //create local user
              return Promise.resolve(createMapHubsUser(profile)); //wrap to support asCallback()
            }else{
              //check if email is in invite list
              return Admin.checkInviteConfirmed(profile._json.email)
              .then(confirmed => {
                if(confirmed){
                  return createMapHubsUser(profile);
                }else{
                  log.warn(`unauthorized user: ${profile._json.email}`);
                  return false;
                }
              });      
            }
          }
        }).asCallback(done);    
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