// @flow
var local = require('../local');
var mailgun = require('mailgun-js')({apiKey: local.MAILGUN_API_KEY, domain: 'maphubs.com'});
var mailcomposer = require('mailcomposer');
var Promise = require("bluebird");

var log = require('./log');
var debug = require('./debug')('email-util');

module.exports = {

/*
data = {
from: 'you@samples.mailgun.org',
to: 'mm@samples.mailgun.org',
subject: 'Test email subject',
body: 'Test email text',
html: '<b> Test email text </b>'
}

*/
send(data: any){
  debug('Send email to ' + data.to + ' with subject: ' + data.subject);
  return new Promise((fulfill, reject) => {
      var mail = mailcomposer(data);
      mail.build((err, message) => {
        if(err){
          reject(err);
        }
        var dataToSend = {
            to: data.to,
            message: message.toString('ascii')
        };

        mailgun.messages().sendMime(dataToSend, (sendError, body) => {
          if (sendError) {
              log.error(sendError);
              reject(sendError);
          }else {
            fulfill(body);
          }
        });
      });
    });

}

};
