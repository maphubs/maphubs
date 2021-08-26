import knex from '../connection'
import { User } from '../types/user'

import nextAuthInvite from '../auth/invite-user'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import SlackNotify from 'slack-notify'
import { Knex } from 'knex'

const usersSelect = (db: Knex) => {
  return db<User>('nextauth_users').select(
    'nextauth_users.id',
    'nextauth_users.email',
    'nextauth_users.role',
    'nextauth_users.terms_accepted',
    'nextauth_users.config'
  )
}

export default {
  async all(): Promise<User[]> {
    return usersSelect(knex).orderBy('nextauth_users.email')
  },

  async byID(id: number): Promise<User | void> {
    const result = await usersSelect(knex).where('nextauth_users.id', id)

    if (result && result.length > 0) {
      return result[0]
    }
  },

  async byEmail(email: string): Promise<User | void> {
    const emailLower = email.toLowerCase()
    const result = await usersSelect(knex).where(
      'nextauth_users.email',
      emailLower
    )

    if (result && result.length > 0) {
      return result[0]
    }
  },

  async byOrganization(organization_id: string): Promise<User[]> {
    return usersSelect(knex)
      .join(
        'organization_members',
        'nextauth_users.id',
        'organization_members.user_id'
      )
      .where('organization_members.organization_id', organization_id)
      .orderBy('nextauth_users.email')
  },

  async inviteUser(email: string): Promise<User | void> {
    // force email to lower case
    email = email.toLowerCase()
    log.info(`inviting user ${email}`)
    // check if we have a local user
    let localUser = await this.byEmail(email)
    if (localUser) throw new Error('A user with this email already exists')
    log.info('Not an existing user')
    // send invite with next-auth (which creates the user)
    try {
      await nextAuthInvite(email, email)
      await this.setRole(email, 'member')
    } catch (err) {
      log.error(err)
      throw new Error('failed to send user invite')
    }

    localUser = await this.byEmail(email)
    if (!localUser) throw new Error('User not found in DB after email sent')
    log.info('Invite email sent')

    log.info('Basic user invite complete!')
    return this.byID(localUser.id)
  },

  async saveTermsAccepted(id: number): Promise<boolean> {
    await usersSelect(knex)
      .update({
        terms_accepted: true
      })
      .where('nextauth_users.id', id)
    const user = await this.byID(id)
    if (process.env.SLACK_WEBHOOK) {
      const slack = SlackNotify(process.env.SLACK_WEBHOOK)
      await new Promise((resolve, reject) => {
        const alert = {
          text: `New User Login ${process.env.NEXT_PUBLIC_PRODUCT_NAME}`,
          icon_emoji: ':earth_asia:',
          attachments: [
            {
              fallback: 'Unknown Error',
              color: '#1dcb1d',
              fields: [
                {
                  title: 'ID',
                  value: user.id
                },
                {
                  title: 'Email',
                  value: user.email
                }
              ]
            }
          ]
        }

        slack.alert(alert, function (err) {
          if (err) {
            console.error('failed to send Slack notication on error')
            reject(err)
          } else {
            resolve(true)
          }
        })
      })
    }
    return true
  },

  async setRole(email: string, role: string): Promise<boolean> {
    await knex('nextauth_users')
      .where('nextauth_users.email', email)
      .update({ role })
    return true
  },

  async delete(id: number): Promise<boolean> {
    await knex('nextauth_users').where('nextauth_users.id', id).del()
    return true
  }
}
