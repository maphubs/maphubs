// @flow
const passport = require('passport')
const local = require('../local')
const AuthUsers = require('./auth-db/users')
const _find = require('lodash.find')
const User = require('../models/user')
const Admin = require('../models/admin')
const Auth0Helper = require('../services/auth0-helper')
const Promise = require('bluebird')
const log = require('@bit/kriscarle.maphubs-utils.services.log')
const shortid = require('shortid')

const saveMapHubsIDToAuth0 = async function (profile, maphubs_user_id) {
  log.info(`saving maphubs id ${maphubs_user_id} to auth0 for host ${local.host}`)
  let hosts = []
  if (profile._json['https://maphubs.com/hosts']) {
    hosts = profile._json['https://maphubs.com/hosts']
  }

  hosts.push({host: local.host, user_id: maphubs_user_id})
  const accessToken = await Auth0Helper.getManagementToken()
  return Auth0Helper.updateAppMetadata({hosts}, accessToken, profile)
}

const determineLocalDisplayName = function (profile) {
  let displayName

  if (profile._json && profile._json.username) {
    displayName = profile._json.username
  } else if (profile.nickname) {
    displayName = profile.nickname
  } else if (profile.displayName) {
    displayName = profile.displayName
  } else {
    displayName = shortid.generate()
  }

  return displayName
}

const createMapHubsUser = async function (profile: Object) {
  const display_name = determineLocalDisplayName(profile)

  const user_id = await User.createUser(profile._json.email, display_name, display_name, profile.id)
  log.info(`Created new MapHubs user ${display_name} with id ${user_id}`)
  await saveMapHubsIDToAuth0(profile, user_id)
  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
  const maphubsUser = await AuthUsers.find(user_id)
  // attach MapHubs User
  profile.maphubsUser = {
    id: maphubsUser.id,
    display_name: maphubsUser.display_name,
    email: maphubsUser.email
  }

  await Admin.sendAdminUserSignupNotification(maphubsUser.email, maphubsUser.display_name)
  return profile
}

const Auth0Strategy = require('passport-auth0')

Auth0Strategy.prototype.authorizationParams = function (options) {
  options = options || {}

  var params = {}
  if (options.connection && typeof options.connection === 'string') {
    params.connection = options.connection
  }
  if (options.audience && typeof options.audience === 'string') {
    params.audience = options.audience
  }
  if (options.prompt && typeof options.prompt === 'string') {
    params.prompt = options.prompt
  }

  if (options.allowsignup && typeof options.allowsignup === 'string') {
    params.allowsignup = options.allowsignup
  }
  if (options.allowlogin && typeof options.allowlogin === 'string') {
    params.allowlogin = options.allowlogin
  }

  if (options.login_hint && typeof options.login_hint === 'string') {
    params.login_hint = options.login_hint
  }

  return params
}

// Configure Passport to use Auth0
const strategy = new Auth0Strategy({
  domain: local.AUTH0_DOMAIN,
  clientID: local.AUTH0_CLIENT_ID,
  clientSecret: local.AUTH0_CLIENT_SECRET,
  callbackURL: local.AUTH0_CALLBACK_URL || 'http://maphubs.test:4000/callback'
}, (accessToken, refreshToken, extraParams, profile, done) => {
  // accessToken is the token to call Auth0 API (not needed in the most cases)
  // extraParams.id_token has the JSON Web Token
  // profile has all the information from the user
  log.info('Auth0 login')
  console.log(profile)
  // check if user has a local user object
  let hosts = []

  if (profile._json['https://maphubs.com/hosts']) {
    hosts = profile._json['https://maphubs.com/hosts']
  }

  const host = _find(hosts, {host: local.host})
  if (host && host.user_id) {
    // local user already linked
    return AuthUsers.find(host.user_id).then(async (maphubsUser) => {
      if (maphubsUser.id !== '1' && local.requireInvite) {
        const allowed = await Admin.checkInviteEmail(maphubsUser.email)
        if (!allowed) {
          log.warn(`unauthorized user: ${maphubsUser.email}`)
          return false
        }
      }
      // attach MapHubs User
      log.info(`Auth0 login successful for ${maphubsUser.id} ${maphubsUser.display_name} ${maphubsUser.email}`)
      profile.maphubsUser = {
        id: maphubsUser.id,
        display_name: maphubsUser.display_name,
        email: maphubsUser.email
      }
      return profile
    }).asCallback(done)
  } else {
    log.warn(`local user not linked: ${profile._json.email}`)
    // attempt to lookup user by email
    return AuthUsers.findByEmail(profile._json.email)
      .then(async (maphubsUser) => {
        if (maphubsUser) {
          if (maphubsUser.id !== '1' && local.requireInvite) {
            const allowed = await Admin.checkInviteEmail(maphubsUser.email)
            if (!allowed) {
              log.warn(`unauthorized user: ${maphubsUser.email}`)
              return false
            }
          }
          // link it back to the Auth0 account
          return saveMapHubsIDToAuth0(profile, maphubsUser.id)
            .then(() => {
              profile.maphubsUser = {
                id: maphubsUser.id,
                display_name: maphubsUser.display_name,
                email: maphubsUser.email
              }
              return profile
            })
        } else {
          // local user not found
          if (!local.requireInvite) {
            // create local user
            return Promise.resolve(createMapHubsUser(profile)) // wrap to support asCallback()
          } else {
            // check if email is in invite list
            return Admin.checkInviteConfirmed(profile._json.email)
              .then(confirmed => {
                if (confirmed) {
                  return createMapHubsUser(profile)
                } else {
                  log.warn(`unauthorized user: ${profile._json.email}`)
                  return false
                }
              })
          }
        }
      }).asCallback(done)
  }
})

passport.use(strategy)

// This can be used to keep a smaller payload
passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})
