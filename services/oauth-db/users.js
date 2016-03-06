var knex = require('../../connection.js');
var log = require('../log.js');


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

  knex.select('*')
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

  knex.select('*')
    .from('users')
    .where('display_name', username)
    .then(function(data) {
      if (data.length == 1) {
        var user = translateUserObject(data[0]);
        return done(null, user);
      } else {
        //not found
        return done('User Not Found', null);
      }

    }).catch(function(err) {
      log.error(err);
      return done(err, null);
    });
};
