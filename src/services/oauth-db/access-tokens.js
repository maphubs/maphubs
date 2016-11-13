var knex = require('../../connection.js');
var log = require('../log.js');


exports.find = function(key, done) {
  knex.select('*')
    .from('oauth_tokens')
    .where('type', 'AccessToken')
    .where('token', key)
    .then(function(data) {
      if (data.length == 1) {
        var token = {
          token: data[0].token,
          secret: data[0].secret,
          userID: data[0].user_id,
          clientID: data[0].client_application_id
        };
        return done(null, token);
      } else {
        //not found
        return done('Access Token Not Found', null);
      }

    }).catch(function(err) {
      log.error(err);
      return done(err, null);
    });
};

exports.save = function(token, secret, userID, clientID, done) {

  knex('oauth_tokens').insert({
    id: knex.raw("(select nextval('oauth_tokens_id_seq'))"),
    type: "AccessToken",
    token,
    secret,
    client_application_id: clientID,
    user_id: userID,
    created_at: knex.raw("now()"),
    updated_at: knex.raw("now()")
  }).then(function() {
    return done(null);
  }).catch(function(err) {
    log.error(err);
    return done(err, null);
  });

};
