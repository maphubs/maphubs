// @flow
const knex = require('../connection')
const debug = require('../services/debug')('models/user')
const Email = require('../services/email-util.js')
const uuid = require('uuid').v4
const urlUtil = require('../services/url-util')
const local = require('../local')

module.exports = {

  async resendInvite (key: string, __: Function) {
    const result = await knex('omh.account_invites').select('email').where({key})
    if (result && result.length === 1) {
      const email = result[0].email
      return this.sendInviteEmail(email, __, key)
    }
    return null
  },

  async sendInviteEmail (email: string, __: Function, resendKey?: string) {
    // create confirm link
    debug.log('sending email invite to: ' + email)

    let key
    if (resendKey) {
      key = resendKey
    } else {
      key = uuid()
      await knex('omh.account_invites').insert({email, key})
    }

    const baseUrl = urlUtil.getBaseUrl()
    const url = baseUrl + '/signup/invite/' + key

    const text =
      __('You have been invited to') + ' ' + MAPHUBS_CONFIG.productName + '!\n\n' +
      __('Please go to this link in your browser to sign up:') + url + '\n\n' +

      __('This invite is only valid for the email address:') + '\n' + email + '\n\n' +
      __('If you need to contact us you are welcome to reply to this email, or use the help button on the website.')

    const html =
      '<br />' + __('You have been invited to') + ' ' + MAPHUBS_CONFIG.productName + '!' +
      '<br />' +
      '<br />' + __('Please go to this link in your browser to sign up:') + url +
      '<br />' +
      '<br />' +
      __('This invite is only valid for the email address:') +
      '<br />' + email + '<br /><br />' +
      __('If you need to contact us you are welcome to reply to this email, or use the help button on the website.')

    await Email.send({
      from: MAPHUBS_CONFIG.productName + ' <' + local.fromEmail + '>',
      to: email,
      subject: __('Account Invite') + ' - ' + MAPHUBS_CONFIG.productName,
      text,
      html
    })
    return key
  },

  async checkInviteKey (key: string) {
    debug.log('checking invite key')
    const result = await knex('omh.account_invites').select('email').where({key})

    if (result && result.length === 1) {
      return true
    }
    return null
  },

  async checkInviteEmail (email: string) {
    debug.log('checking invite key')
    const result = await knex('omh.account_invites').select('email').where({email})

    if (result && result.length > 0) {
      return true
    }
    return null
  },

  /**
   * Check if the provide email has been invited and confirmed by the user
   * @param {*} email
   */
  async checkInviteConfirmed (email: string) {
    const results = await knex('omh.account_invites').where({email, used: true})

    if (results && Array.isArray(results) && results.length >= 1) {
      return true
    } else {
      return false
    }
  },

  async useInvite (key: string) {
    debug.log('using invite key')
    await knex('omh.account_invites').update({used: true}).where({key})

    const result = await knex('omh.account_invites').select('email').where({key})
    if (result && result.length === 1) {
      return result[0].email
    } else {
      return null
    }
  },

  getMembers (trx: any) {
    const db = trx || knex
    return db('users')
      .fullOuterJoin('omh.account_invites', 'users.email', 'omh.account_invites.email')
      .fullOuterJoin('omh.admins', 'users.id', 'omh.admins.user_id')
      .select('users.id', 'users.display_name', 'users.email', 'omh.account_invites.email as invite_email', 'omh.account_invites.key', 'omh.account_invites.used', 'omh.admins.user_id as admin')
      .orderBy('users.id')
  },

  getAdmins (trx: any) {
    const db = trx || knex
    return db('omh.admins').leftJoin('users', 'omh.admins.user_id', 'users.id')
      .select('users.id', 'users.email', 'users.display_name')
  },

  deauthorize (email: string, key: string, trx: any) {
    const db = trx || knex
    return db('omh.account_invites').del().where({email, key})
  },

  async checkAdmin (userId: number, trx: any) {
    const db = trx || knex
    const result = await db('omh.admins').select('user_id').where({user_id: userId})

    if (result && result.length === 1) {
      return true
    }
    return false
  },

  async sendAdminUserSignupNotification (user_email: string, display_name: string) {
    const admins = await this.getAdmins()
    admins.push({
      email: local.adminEmail
    })
    admins.forEach(async (admin) => {
      const text =
      'New user signup for ' + local.productName + '\n\n' +
      'Username:' + ' ' + display_name + '\n' +
      'Email Address:' + ' ' + user_email + '\n'

      const html =
        '<br />' + 'New user signup for ' + local.productName +
        '<br />' +
        '<br />' + 'Username:' + ' ' + display_name +
        '<br />' + 'Email Address:' + ' ' + user_email +
        '<br />'

      await Email.send({
        from: MAPHUBS_CONFIG.productName + ' <' + local.fromEmail + '>',
        to: admin.email,
        subject: 'New User Signup' + ' - ' + MAPHUBS_CONFIG.productName,
        text,
        html
      })
    })
  }
}
