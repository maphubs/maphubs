// @flow
const Promise = require('bluebird')
const nodemailer = require('nodemailer')
const aws = require('aws-sdk')
aws.config.update({region: 'us-east-1'})

const transporter = nodemailer.createTransport({
  SES: new aws.SES({apiVersion: '2010-12-01'})
})
const log = require('./log')
const debug = require('./debug')('email-util')

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

  send (data: any) {
    debug.log('Send email to ' + data.to + ' with subject: ' + data.subject)
    return new Promise((resolve, reject) => {
      transporter.sendMail(data, (error, info) => {
        if (error) {
          log.error(error)
          reject(error)
        } else {
          log.info(`Message ${info.messageId} sent: ${info.response}`)
          resolve(info)
        }
      })
    })
  }

}
