// @flow
var knex = require('../connection');
var log = require('./log');
var debug = require('./debug')('password-util');
var uuid = require('uuid').v4;
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
Promise.promisifyAll(bcrypt);

var Email = require('./email-util.js');
var User = require('../models/user');

var urlUtil = require('./url-util');
var local = require('../local');

module.exports = {


  checkPassword(user_id: number, password: string, cb: Function){

    return User.getUser(user_id, true)
    .then((user) => {
      debug('checking password for: ' + user.display_name);
      bcrypt.compare(password, user.pass_crypt, (err, res) => {
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
    }).catch((err: Error) => {
      log.error(err);
    });

  },

  updatePassword(user_id: number, password: string, sendEmail: boolean, __: Function){
    return User.getUser(user_id, true)
    .then((user) => {
      debug('Updating password for: ' + user.display_name);
      return bcrypt.genSaltAsync(10).then((salt) => {
        debug('created salt: ' + salt);
        return bcrypt.hashAsync(password, salt)
        .then((hash) => {
          debug('created hash: ' + hash);
          return knex('users').update({pass_crypt: hash, pass_reset: null}).where({id: user_id})
          .then(() => {
            debug('database updated');
            if(sendEmail){
              return Email.send({
                from: MAPHUBS_CONFIG.productName + ' <' + local.fromEmail + '>',
                to: user.email,
                subject: __('Password Changed') + ' - ' + MAPHUBS_CONFIG.productName,
                text: user.display_name + ',\n' +
                  __('Your password was changed.')
                ,
                html: user.display_name + ',' + '<br />' +
                  __('Your password was changed.')
              });
            }else {
              return true;
            }

          });
        });
      });
    })
    .catch((err: Error) => {
      log.error(err);
    });
  },

  forgotPassword(email: string, __: Function){
    return User.getUserByEmail(email, true)
    .then((user) => {
      if(!user) throw new Error('User not found');
      //generate a unique reset link
      var pass_reset = uuid();
      knex('users').update({pass_reset}).where({id: user.id})
      .then(() => {
        var baseUrl = urlUtil.getBaseUrl();
        var url = baseUrl + '/user/passwordreset/' + pass_reset;
        Email.send({
          from: MAPHUBS_CONFIG.productName + ' <' + local.fromEmail + '>',
          to: user.email,
          subject: __('Password Reset') + ' - ' + MAPHUBS_CONFIG.productName,
          body: user.display_name + ',\n' +
            __('Please go to this link in your browser to reset your password:') + ' ' + url
          ,
          html: user.display_name + ',<br />' +
            __('Please go to this link in your browser to reset your password:') + ' ' + url
        })
        .catch((err: Error) => {
          log.error(err);
        });
      });

    });

  }

};
