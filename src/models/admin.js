var knex = require('../connection');
var debug = require('../services/debug')('models/user');
var Email = require('../services/email-util.js');
var uuid = require('node-uuid');
var urlUtil = require('../services/url-util');
var local = require('../local');


module.exports = {

  sendInviteEmail(email, __){
    //create confirm link
    debug('sending email invite to: ' + email);
    var key = uuid.v4();
    return knex('omh.account_invites').insert({email, key})
    .then(function(){
        var baseUrl = urlUtil.getBaseUrl();
        var url = baseUrl + '/signup/invite/' + key;

          var text =
            __('You have been invited to') + ' ' + MAPHUBS_CONFIG.productName + '!\n\n' +
            __('Please go to this link in your browser to sign up:')  + url + '\n\n' +

            __('This invite is only valid for the email address:') + '\n' + email  + '\n\n' +
            __('If you need to contact us you are welcome to reply to this email, or use the help button on the website.');


          var html =
            '<br />' + __('You have been invited to') + ' ' + MAPHUBS_CONFIG.productName + '!' +
            '<br />' +
            '<br />' + __('Please go to this link in your browser to sign up:') + url +
            '<br />' +
            '<br />' +
            __('This invite is only valid for the email address:') +
            '<br />' + email  + '<br /><br />' +
            __('If you need to contact us you are welcome to reply to this email, or use the help button on the website.');

          return Email.send({
              from: MAPHUBS_CONFIG.productName + ' <' + local.fromEmail + '>',
              to: email,
              subject: __('Account Invite') + ' - ' + MAPHUBS_CONFIG.productName,
              text,
              html
            });
      });
  },

  checkInviteKey(key){
    debug('checking invite key');
    return knex('omh.account_invites').select('email').where({key, used:false})
    .then(function(result){
      if(result && result.length === 1){
        return true;
      }
      return null;
    });
  },

  useInvite(key){
    debug('using invite key');
    return knex('omh.account_invites').update({used:true}).where({key})
    .then(function(){
      return knex('omh.account_invites').select('email').where({key})
      .then(function(result){
        if(result && result.length === 1){
          return result[0].email;
        }else{
          return null;
        }
      });
    });
  },

  checkAdmin(user_id){
    return knex('omh.admins').select('user_id').where({user_id})
    .then(function(result){
      if(result && result.length === 1){
        return true;
      }
      return null;
    });
  }


};
