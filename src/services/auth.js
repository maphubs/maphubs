// @flow
var passport = require('passport'),
  //OpenStreetMapStrategy = require('passport-openstreetmap').Strategy,
  LocalStrategy = require('passport-local').Strategy,
  //BasicStrategy = require('passport-http').BasicStrategy,
  ConsumerStrategy = require('passport-http-oauth').ConsumerStrategy,
  TokenStrategy = require('passport-http-oauth').TokenStrategy,
  //ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
  //BearerStrategy = require('passport-http-bearer').Strategy,
  db = require('./oauth-db'),
  PasswordUtil = require('./password-util');


//var OPENSTREETMAP_CONSUMER_KEY = "CdrJjtCvDvys90a3jYdhlLUY8s5N50JkDBai4xDI";
//var OPENSTREETMAP_CONSUMER_SECRET = "uaB6OoPQnXAc80239Zr3ZuZPQ1kBNLhUYR1MRzPN";


/**
 * ConsumerStrategy
 *
 * This strategy is used to authenticate registered OAuth consumers (aka
 * clients).  It is employed to protect the `request_tokens` and `access_token`
 * endpoints, which consumers use to request temporary request tokens and access
 * tokens.
 */
passport.use('consumer', new ConsumerStrategy(
  // consumer callback
  //
  // This callback finds the registered client associated with `consumerKey`.
  // The client should be supplied to the `done` callback as the second
  // argument, and the consumer secret known by the server should be supplied
  // as the third argument.  The `ConsumerStrategy` will use this secret to
  // validate the request signature, failing authentication if it does not
  // match.
  function(consumerKey, done) {
    db.clients.findByConsumerKey(consumerKey, function(err, client) {
      if (err) {
        return done(err);
      }
      if (!client) {
        return done(null, false);
      }
      return done(null, client, client.consumerSecret);
    });
  },
  // token callback
  //
  // This callback finds the request token identified by `requestToken`.  This
  // is typically only invoked when a client is exchanging a request token for
  // an access token.  The `done` callback accepts the corresponding token
  // secret as the second argument.  The `ConsumerStrategy` will use this secret to
  // validate the request signature, failing authentication if it does not
  // match.
  //
  // Furthermore, additional arbitrary `info` can be passed as the third
  // argument to the callback.  A request token will often have associated
  // details such as the user who approved it, scope of access, etc.  These
  // details can be retrieved from the database during this step.  They will
  // then be made available by Passport at `req.authInfo` and carried through to
  // other middleware and request handlers, avoiding the need to do additional
  // unnecessary queries to the database.
  function(requestToken, done) {
    db.requestTokens.find(requestToken, function(err, token) {
      if (err) {
        return done(err);
      }

      //get the callbackURL directly from the database
      db.clients.find(token.clientID, function(err, client) {
        if (err) {
          return done(err);
        }
        var info = {
          verifier: token.verifier,
          clientID: token.clientID,
          userID: token.userID,
          approved: token.approved,
          oauth_callback: client.callbackURL
        };
        done(null, token.secret, info);
      });


    });
  },
  // validate callback
  //
  // The application can check timestamps and nonces, as a precaution against
  // replay attacks.  In this example, no checking is done and everything is
  // accepted.
  function(timestamp, nonce, done) {
    done(null, true);
  }
));

/**
 * TokenStrategy
 *
 * This strategy is used to authenticate users based on an access token.  The
 * user must have previously authorized a client application, which is issued an
 * access token to make requests on behalf of the authorizing user.
 */
passport.use('token', new TokenStrategy(
  // consumer callback
  //
  // This callback finds the registered client associated with `consumerKey`.
  // The client should be supplied to the `done` callback as the second
  // argument, and the consumer secret known by the server should be supplied
  // as the third argument.  The `TokenStrategy` will use this secret to
  // validate the request signature, failing authentication if it does not
  // match.
  function(consumerKey, done) {
    db.clients.findByConsumerKey(consumerKey, function(err, client) {
      if (err) {
        return done(err);
      }
      if (!client) {
        return done(null, false);
      }
      return done(null, client, client.consumerSecret);
    });
  },
  // verify callback
  //
  // This callback finds the user associated with `accessToken`.  The user
  // should be supplied to the `done` callback as the second argument, and the
  // token secret known by the server should be supplied as the third argument.
  // The `TokenStrategy` will use this secret to validate the request signature,
  // failing authentication if it does not match.
  //
  // Furthermore, additional arbitrary `info` can be passed as the fourth
  // argument to the callback.  An access token will often have associated
  // details such as scope of access, expiration date, etc.  These details can
  // be retrieved from the database during this step.  They will then be made
  // available by Passport at `req.authInfo` and carried through to other
  // middleware and request handlers, avoiding the need to do additional
  // unnecessary queries to the database.
  //
  // Note that additional access control (such as scope of access), is an
  // authorization step that is distinct and separate from authentication.
  // It is an application's responsibility to enforce access control as
  // necessary.
  function(accessToken, done) {
    db.accessTokens.find(accessToken, function(err, token) {
      if (err) {
        return done(err);
      }
      db.users.find(token.userID, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        // to keep this example simple, restricted scopes are not implemented
        var info = {
          scope: '*'
        };
        done(null, user, token.secret, info);
      });
    });
  },
  // validate callback
  //
  // The application can check timestamps and nonces, as a precaution against
  // replay attacks.  In this example, no checking is done and everything is
  // accepted.
  function(timestamp, nonce, done) {
    done(null, true);
  }
));


/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(
  function(username, password, done) {
    db.users.findByUsername(username, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (!user) {
        return done(null, false);
      }
      //check password against hash from database
      PasswordUtil.checkPassword(user.id, password, function(valid){
        if(valid){
          return done(null, user);
        }else{
          return done(null, false);
        }
      });
    });
  }
));

/*
passport.use(new OpenStreetMapStrategy({
    consumerKey: OPENSTREETMAP_CONSUMER_KEY,
    consumerSecret: OPENSTREETMAP_CONSUMER_SECRET,
    callbackURL: "http://localhost:4000/auth/openstreetmap/callback"
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function() {

      db.users.findByUsername(profile.displayName, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      });

    });
  }
));
*/


passport.serializeUser(function(user, done) {
  done(null, user);
});


passport.deserializeUser(function(user, done) {
  db.users.find(user.id, function(err, user) {
    done(err, user);
  });
});
