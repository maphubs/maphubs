// @flow
const knex = require('../connection')
const log = require('../services/log')
const debug = require('../services/debug')('models/user')

module.exports = {

  /**
   * Get data about the current user
   * @param id
   * @returns {Promise.<T>}
   */
  async getUser (id: number, secure: boolean = false) {
    debug.log('getting for id: ' + id)
    let user = {}
    const result = await knex('users').where('id', id)
    if (!result || result.length !== 1) {
      throw new Error('User not found')
    } else {
      user = result[0]
      if (!secure) {
        // exclude sensitive info
        delete user.creation_ip
        delete user.new_email
        delete user.pass_crypt
        delete user.pass_reset
      }
      return user
    }
  },

  async getUserByName (display_name: string, secure: boolean = false) {
    debug.log('getting user with name: ' + display_name)

    display_name = display_name.toLowerCase()

    const result = await knex('users')
      .where(knex.raw(`lower(display_name)`), '=', display_name)

    if (result && result.length === 1) {
      const user = result[0]

      if (!secure) {
        // exclude sensitive info
        delete user.creation_ip
        delete user.new_email
        delete user.pass_crypt
        delete user.pass_reset
      }
      return user
    } else {
      log.warn('user not found: ' + display_name)
      return null
    }
  },

  async getUserByEmail (email: string, secure: boolean = false) {
    debug.log('getting user with email: ' + email)

    email = email.toLowerCase()

    const result = await knex('users')
      .where(knex.raw(`lower(email)`), '=', email)

    if (result && result.length === 1) {
      const user = result[0]

      if (!secure) {
        // exclude sensitive info
        delete user.creation_ip
        delete user.new_email
        delete user.pass_crypt
        delete user.pass_reset
      }

      return user
    } else if (result && result.length > 1) {
      const msg = 'found multiple users with email: ' + email
      log.error(msg)
      throw new Error(msg)
    } else {
      const msg = 'email not found: ' + email
      log.error(msg)
      return null
    }
  },

  async createUser (email: string, name: string, display_name: string, creation_ip: string) {
    email = email.toLowerCase()
    display_name = display_name.toLowerCase()

    const user_id = await knex('users').returning('id')
      .insert({
        email,
        display_name,
        name,
        pass_crypt: '1234', // note, this is immediately replaced, value here is just due to not null constraint
        creation_ip,
        creation_time: knex.raw('now()')
      })
    return parseInt(user_id)
  },

  getSearchSuggestions (input: string) {
    input = input.toLowerCase()
    return knex.select('display_name', 'id').table('users')
      .where(knex.raw(`lower(display_name)`), 'like', '%' + input + '%')
  }

}
