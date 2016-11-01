var knex = require('../../connection.js');
var log = require('../log.js');
var debug = require('../debug')('oauth-db/users');


function translateUserObject(data) {

  var user = {
    id: data.id,
    display_name: data.display_name,
    pass_crypt: data.pass_crypt,
    description: data.description
  };

  return user;
}

exports.find = function(id, done) {
  debug('find by id: ' + id);
  return knex.select('*')
    .from('users')
    .where('id', id)
    .then(function(data) {
      if (data.length == 1) {
        var user = translateUserObject(data[0]);
        return done(null, user);
      } else {
        //not found
        return done('User Not Found: ' + id, null);
      }

    }).catch(function(err) {
      log.error(err);
      return done(err, null);
    });

};

exports.findByUsername = function(username, done) {
  debug('find by username: ' + username);

  username = username.toLowerCase();

  return knex.select('*')
    .from('users')
    .where(knex.raw('lower(display_name)'), '=', username)
    .then(function(data) {
      if (data.length == 1) {
        var user = translateUserObject(data[0]);
        return done(null, user);
      } else {
        //not found
        return done(null, null);
      }

    }).catch(function(err) {
      log.error(err);
      return done(err, null);
    });
};
