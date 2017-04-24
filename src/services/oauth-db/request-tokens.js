var knex = require('../../connection.js');
var log = require('../log.js');
var debug = require('../debug')('request-tokens');


exports.find = function(key, done) {
  debug('finding request token: ' + key);
  knex.select(knex.raw('*, CASE WHEN (authorized_at IS NOT NULL AND invalidated_at IS NULL) THEN 1 ELSE 0 END as approved'))
    .from('oauth_tokens')
    .where('type', 'RequestToken')
    .where('token', key)
    .then((data) => {
      if (data.length == 1) {
        var token = {
          token: data[0].token,
          secret: data[0].secret,
          clientID: data[0].client_application_id,
          userID: data[0].user_id,
          callbackURL: data[0].callback_url,
          approved: data[0].approved,
          verifier: data[0].verifier
        };
        if (token.approved == 1) token.approved = true;
        else token.approved = false;
        return done(null, token);
      } else {
        //not found
        return done('Request Token Not Found', null);
      }

    }).catch((err) => {
      log.error(err);
      return done(err, null);
    });

};

exports.save = function(token, secret, clientID, callbackURL, done) {
  debug('saving request token: ' + token + ' for client: ' + clientID);
  knex('oauth_tokens').insert({
    id: knex.raw("(select nextval('oauth_tokens_id_seq'))"),
    type: "RequestToken",
    token,
    secret,
    client_application_id: clientID,
    callback_url: callbackURL,
    created_at: knex.raw("now()"),
    updated_at: knex.raw("now()")
  }).then(() => {
    return done(null);
  }).catch((err) => {
    log.error(err);
    return done(err, null);
  });
};

exports.approve = function(key, userID, verifier, done) {
  debug('approving request token: ' + key + ' for user: ' + userID);
  knex('oauth_tokens')
    .where('token', key)
    .where('type', 'RequestToken')
    .update({
      user_id: userID,
      verifier,
      authorized_at: knex.raw("now()"),
      updated_at: knex.raw("now()")
    }).then(() => {
      return done(null);
    }).catch((err) => {
      log.error(err);
      return done(err, null);
    });

};
