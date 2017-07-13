// @flow
var Promise = require("bluebird");
const nodemailer = require('nodemailer');
let aws = require('aws-sdk');
aws.config.update({region: 'us-east-1'});

let transporter = nodemailer.createTransport({
    SES: new aws.SES({apiVersion: '2010-12-01'})
});
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
  debug.log('Send email to ' + data.to + ' with subject: ' + data.subject);
  return new Promise((resolve, reject) => {

    transporter.sendMail(data, (error, info) => {
      if (error) {
        log.error(error);
        reject(error);
      }else{
        log.info(`Message ${info.messageId} sent: ${info.response}`);
        resolve(info);
      }
    });
  });
}

};
