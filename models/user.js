var knex = require('../connection');
var Promise = require('bluebird');
var log = require('../services/log');
var debug = require('../services/debug')('models/user');

var Email = require('../services/email-util.js');
var uuid = require('node-uuid');
var urlUtil = require('../services/url-util');
var config = require('../clientconfig');


module.exports = {

  /**
   * Get data about the current user
   * @param id
   * @returns {Promise.<T>}
   */
  getUser(id, secure=false) {
    debug('getting for id: ' + id);
      var user = {};

      return Promise.all([
          knex('users').where('id', id),
          knex('user_roles').where('user_id', id),
          knex('messages').where('to_user_id', id),
          knex('user_blocks').where('user_id', id),
          knex('user_preferences').where('user_id', id)
        ])
        .then(function(resultArr) {
          user = resultArr[0][0];
          user.roles = resultArr[1];
          user.messages = resultArr[2];
          user.blocks = resultArr[3];
          user.preferences = resultArr[4];

          if(!secure){
            //exclude sensitive info
            delete user.creation_ip;
            delete user.new_email;
            delete user.pass_crypt;
            delete user.pass_reset;
          }

          return user;
        });
    },

    getUserByName(display_name, secure=false) {

      debug('getting user with name: ' + display_name);

      return knex('users').where({display_name})
      .then(function(result){
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
          throw new Error("user not found: "+ display_name);
        }
      });
    },

    getUserByEmail(email, secure=false){

      debug('getting user with email: ' + email);

      return knex('users').where({email})
      .then(function(result){
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
          throw new Error(msg);
        }
      });
    },

    getUserWithResetKey(key) {

      debug('getting user with password reset key');

      return knex('users').where({pass_reset: key})
      .then(function(result){
        if(result && result.length === 1){
          var user = result[0];

          //exclude sensitive info
          delete user.creation_ip;
          delete user.new_email;
          delete user.pass_crypt;

          return user;
        } else {
          return null;
        }
        });
    },

    getUserWithConfirmationKey(key) {

      debug('getting user with email confirmation key');

      return knex('users').where({new_email: key})
      .then(function(result){
        if(result && result.length === 1){
          var user = result[0];

          //exclude sensitive info
          delete user.creation_ip;
          delete user.pass_crypt;
          delete user.pass_reset;

          return user;
        } else {
          return null;
        }
        });
    },

    createUser(email, display_name, creation_ip){
      return knex('users').returning('id')
        .insert({
            email,
            display_name,
            pass_crypt: '1234',
            creation_ip,
            creation_time: knex.raw('now()')
        }).then(function(user_id){
          return parseInt(user_id);
        });
    },

    sendConfirmationEmail(user_id){
      //create confirm link
      debug('sending email confirmation for id: ' + user_id);
      var _this = this;
      var new_email = uuid.v4();
      return knex('users').update({new_email}).where({id: user_id})
      .then(function(){
        _this.getUser(user_id)
          .then(function(user){
          var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
          var url = baseUrl + '/user/emailconfirmation/' + new_email;
            return Email.send({
              from: 'MapHubs <info@maphubs.com>',
              to: user.email,
              subject: 'Email Confirmation - MapHubs',
              body: user.display_name + `\n,
                Welcome to MapHubs!\n\n
                Please go to this URL in your browser to confirm your email: ` + url
              ,
              html: user.display_name + `,
                <br />Welcome to MapHubs!
                <br />
                <br />Please <a href="` + url + `">click here </a>to confirm your email, or go to this URL in your browser: ` + url
              });
            });
        });
    },

    checkEmailConfirmation(key){
      debug('checking email confirmation');
      return this.getUserWithConfirmationKey(key)
      .then(function(user){
        //key matches
        log.info("Email Confirmed for user: " + user.display_name);
        return knex('users').update({new_email: '', email_valid: true}).where({id: user.id});
      });
    },

    checkUserNameAvailable(username) {
      return this.getUserByName(username)
        .then(function(result) {
          if (result == null) return true;
          return false;
        }).catch(function() {
          //user not found, therefore name is avaliable
          return true;
        });
    },


    getSearchSuggestions(input) {
      input = input.toLowerCase();
      return knex.select('display_name', 'id').table('users').whereRaw("lower(display_name) like '%" + input + "%'");
    }

};
