//@flow
const knex = require('../../connection.js');
const log = require('../log.js');
const debug = require('../debug')('oauth-db/users');

function translateUserObject(data: Object) {

  const user = {
    id: data.id,
    display_name: data.display_name,
    pass_crypt: data.pass_crypt,
    description: data.description,
    email: data.email
  };

  return user;
}

exports.find = function(id: number) {
  debug.log('find by id: ' + id);
  return knex.select('*')
    .from('users')
    .where('id', id)
    .then((data) => {
      if (data.length === 1) {
        return translateUserObject(data[0]);
      } else {
        //not found
        throw new Error(`User Not Found: ${id}`);
      }
    }).catch((err) => {
      log.error(err);
      throw err;
    });
};

exports.findByEmail = function(email: string) {
  debug.log(`find by email: ${email}`);
  return knex.select('*')
    .from('users')
    .where('email', email)
    .then((data) => {
      if (data.length === 1) {
        return translateUserObject(data[0]);
      } else {
        //not found
        log.info(`email not found: ${email}`);
        return null;
      }
    }).catch((err) => {
      log.error(err);
      throw err;
    });
};