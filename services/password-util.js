/* @flow weak */
var knex = require('../connection');
var log = require('./log');
var debug = require('./debug')('password-util');
var uuid = require('node-uuid');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
Promise.promisifyAll(bcrypt);

var Email = require('./email-util.js');
var User = require('../models/user');

var urlUtil = require('./url-util');
var config = require('../clientconfig');

module.exports = {


  checkPassword(user_id, password, cb){

    return User.getUser(user_id, true)
    .then(function(user){
      debug('checking password for: ' + user.display_name);
      bcrypt.compare(password, user.pass_crypt, function(err, res) {
        if(err){
          log.error(err);
        }
        if(res == true){
          cb(true);
        }else{
          log.warn('Invalid Password Attempt for: ' + user.display_name);
          cb(false);
        }
      });
    }).catch(function(err){
      log.error(err);
    });

  },

  updatePassword(user_id, password, sendEmail){
    return User.getUser(user_id, true)
    .then(function(user){
      debug('Updating password for: ' + user.display_name);
      return bcrypt.genSaltAsync(10).then(function(salt) {
        debug('created salt: ' + salt);
        return bcrypt.hashAsync(password, salt)
        .then(function(hash){
          debug('created hash: ' + hash);
          return knex('users').update({pass_crypt: hash, pass_reset: null}).where({id: user_id})
          .then(function(){
            debug('database updated');
            if(sendEmail){
              return Email.send({
                from: 'MapHubs<info@maphubs.com>',
                to: user.email,
                subject: 'Password Changed - MapHubs',
                body: user.display_name + `,
                  Your password on MapHubs was changed.
                `,
                html: user.display_name + `,
                  Your password on MapHubs was changed.
                `
              });
            }else {
              return true;
            }

          });
        });
      });
    })
    .catch(function(err){
      log.error(err);
    });
  },

  forgotPassword(email){
    return User.getUserByEmail(email, true)
    .then(function(user){
      //generate a unique reset link
      var pass_reset = uuid.v4();
      knex('users').update({pass_reset}).where({id: user.id})
      .then(function(){
        var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
        var url = baseUrl + '/user/passwordreset/' + pass_reset;
        Email.send({
          from: 'MapHubs <info@maphubs.com>',
          to: user.email,
          subject: 'Password Reset - MapHubs',
          body: user.display_name + `\n,
            Please go to this URL in your browser to reset your password: ` + url
          ,
          html: user.display_name + `,
            <br />Please <a href="` + url + `">click here </a>to reset your password, or go to this URL in your browser: ` + url
        })
        .catch(function(err){
          log.error(err);
        });
      });

    });

  }

};
