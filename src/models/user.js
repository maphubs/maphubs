// @flow
var knex = require('../connection');
var log = require('../services/log');
var debug = require('../services/debug')('models/user');

module.exports = {

  /**
   * Get data about the current user
   * @param id
   * @returns {Promise.<T>}
   */
  getUser(id: number, secure: boolean=false) {
    debug.log('getting for id: ' + id);
      var user = {};

      return knex('users').where('id', id)
        .then((result) => {
          if(!result || result.length !== 1){
            throw new Error('User not found');
          }else{
            user = result[0];
            if(!secure){
              //exclude sensitive info
              delete user.creation_ip;
              delete user.new_email;
              delete user.pass_crypt;
              delete user.pass_reset;
            }
            return user;
          }    
        });
    },

    getUserByName(display_name: string, secure: boolean=false) {

      debug.log('getting user with name: ' + display_name);

      display_name = display_name.toLowerCase();

      return knex('users')
      .where(knex.raw(`lower(display_name)`), '=', display_name)
      .then((result) => {
        if(result && result.length === 1){
          var user = result[0];

          if(!secure){
            //exclude sensitive info
            delete user.creation_ip;
            delete user.new_email;
            delete user.pass_crypt;
            delete user.pass_reset;
          }

          return user;
        }else {
          log.warn("user not found: "+ display_name);
          return null;
        }
      });
    },

    getUserByEmail(email: string, secure: boolean=false){

      debug.log('getting user with email: ' + email);

      email = email.toLowerCase();

      return knex('users')
      .where(knex.raw(`lower(email)`), '=', email)
      .then((result) => {
        if(result && result.length === 1){
          var user = result[0];

          if(!secure){
            //exclude sensitive info
            delete user.creation_ip;
            delete user.new_email;
            delete user.pass_crypt;
            delete user.pass_reset;
          }

          return user;
        }else if(result && result.length > 1) {
          let msg = "found multiple users with email: "+ email;
          log.error(msg);
          throw new Error(msg);
        } else {
          let msg = "email not found: "+ email;
          log.error(msg);
          return null;
        }
      });
    },

    createUser(email: string, name: string, display_name: string, creation_ip: string){

      email = email.toLowerCase();
      display_name = display_name.toLowerCase();

      return knex('users').returning('id')
        .insert({
            email,
            display_name,
            name,
            pass_crypt: '1234', //note, this is immediately replaced, value here is just due to not null constraint
            creation_ip,
            creation_time: knex.raw('now()')
        }).then((user_id) => {
          return parseInt(user_id);
        });
    },

    getSearchSuggestions(input: string) {
      input = input.toLowerCase();
      return knex.select('display_name', 'id').table('users')
      .where(knex.raw(`lower(display_name)`), 'like', '%' + input + '%');
    }

};
