import { v4 as uuidv4 } from 'uuid'
import knex from '../connection'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import Email from '@bit/kriscarle.maphubs-utils.maphubs-utils.email-util'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import { Knex } from 'knex'

const debug = DebugService('models/user')

export default {
  async resendInvite(
    key: string,
    __: (...args: Array<any>) => any
  ): Promise<any> {
    const result = await knex('omh.account_invites').select('email').where({
      key
    })

    if (result && result.length === 1) {
      const email = result[0].email
      return this.sendInviteEmail(email, __, key)
    }
  },

  async sendInviteEmail(
    email: string,
    __: (...args: Array<any>) => any,
    resendKey?: string
  ): Promise<string> {
    // create confirm link
    email = email.toLowerCase()
    debug.log('sending email invite to: ' + email)
    let key

    if (resendKey) {
      key = resendKey
    } else {
      key = uuidv4()
      await knex('omh.account_invites').insert({
        email,
        key
      })
    }

    const baseUrl = urlUtil.getBaseUrl()
    const url = baseUrl + '/signup/invite/' + key

    const text =
      __('You have been invited to') +
      ' ' +
      process.env.NEXT_PUBLIC_PRODUCT_NAME +
      '!\n\n' +
      __('Please go to this link in your browser to sign up:') +
      url +
      '\n\n' +
      __('This invite is only valid for the email address:') +
      '\n' +
      email +
      '\n\n' +
      __(
        'If you need to contact us you are welcome to reply to this email, or use the help button on the website.'
      )

    const html =
      '<br />' +
      __('You have been invited to') +
      ' ' +
      process.env.NEXT_PUBLIC_PRODUCT_NAME +
      '!' +
      '<br />' +
      '<br />' +
      __('Please go to this link in your browser to sign up:') +
      url +
      '<br />' +
      '<br />' +
      __('This invite is only valid for the email address:') +
      '<br />' +
      email +
      '<br /><br />' +
      __(
        'If you need to contact us you are welcome to reply to this email, or use the help button on the website.'
      )

    await Email.send({
      from:
        process.env.NEXT_PUBLIC_PRODUCT_NAME +
        ' <' +
        process.env.FROM_EMAIL +
        '>',
      to: email,
      subject:
        __('Account Invite') + ' - ' + process.env.NEXT_PUBLIC_PRODUCT_NAME,
      text,
      html
    })
    return key
  },

  async checkInviteKey(key: string): Promise<boolean> {
    debug.log('checking invite key')
    const result = await knex('omh.account_invites').select('email').where({
      key
    })

    if (result && result.length === 1) {
      return true
    }

    return false
  },

  async checkInviteEmail(email: string): Promise<boolean> {
    debug.log('checking invite key')
    const result = await knex('omh.account_invites').select('email').where({
      email
    })

    if (result && result.length > 0) {
      return true
    }

    return false
  },

  /**
   * Check if the provide email has been invited and confirmed by the user
   * @param {*} email
   */
  async checkInviteConfirmed(email: string): Promise<boolean> {
    email = email.toLowerCase()
    const results = await knex('omh.account_invites').where({
      email,
      used: true
    })

    return results && Array.isArray(results) && results.length >= 1
      ? true
      : false
  },

  async useInvite(key: string): Promise<any> {
    debug.log('using invite key')
    await knex('omh.account_invites')
      .update({
        used: true
      })
      .where({
        key
      })
    const result = await knex('omh.account_invites').select('email').where({
      key
    })

    return result && result.length === 1 ? result[0].email : null
  },

  getMembers(trx?: Knex.Transaction): any {
    const db = trx || knex
    return db('users')
      .fullOuterJoin(
        'omh.account_invites',
        'users.email',
        'omh.account_invites.email'
      )
      .fullOuterJoin('omh.admins', 'users.id', 'omh.admins.user_id')
      .select(
        'users.id',
        'users.display_name',
        'users.email',
        'omh.account_invites.email as invite_email',
        'omh.account_invites.key',
        'omh.account_invites.used',
        'omh.admins.user_id as admin'
      )
      .orderBy('users.id')
  },

  getAdmins(trx?: Knex.Transaction): any {
    const db = trx || knex
    return db('omh.admins')
      .leftJoin('users', 'omh.admins.user_id', 'users.id')
      .select('users.id', 'users.email', 'users.display_name')
  },

  deauthorize(email: string, key: string, trx?: Knex.Transaction): any {
    const db = trx || knex
    return db('omh.account_invites').del().where({
      email,
      key
    })
  },

  async checkAdmin(userId: number, trx?: Knex.Transaction): Promise<boolean> {
    const db = trx || knex
    const result = await db('omh.admins').select('user_id').where({
      user_id: userId
    })

    if (result && result.length === 1) {
      return true
    }

    return false
  },

  async sendAdminUserSignupNotification(
    user_email: string,
    display_name: string
  ): Promise<void> {
    const admins = await this.getAdmins()
    admins.push({
      email: process.env.adminEmail
    })
    admins.forEach(async (admin) => {
      const text =
        'New user signup for ' +
        process.env.NEXT_PUBLIC_PRODUCT_NAME +
        '\n\n' +
        'Username:' +
        ' ' +
        display_name +
        '\n' +
        'Email Address:' +
        ' ' +
        user_email +
        '\n'
      const html =
        '<br />' +
        'New user signup for ' +
        process.env.NEXT_PUBLIC_PRODUCT_NAME +
        '<br />' +
        '<br />' +
        'Username:' +
        ' ' +
        display_name +
        '<br />' +
        'Email Address:' +
        ' ' +
        user_email +
        '<br />'
      await Email.send({
        from:
          process.env.NEXT_PUBLIC_PRODUCT_NAME +
          ' <' +
          process.env.FROM_EMAIL +
          '>',
        to: admin.email,
        subject:
          'New User Signup' + ' - ' + process.env.NEXT_PUBLIC_PRODUCT_NAME,
        text,
        html
      })
    })
  }
}
