import { Context } from '../../types/graphqlContext'
import { LocalizedString } from '../../types/LocalizedString'
import Email from '@bit/kriscarle.maphubs-utils.maphubs-utils.email-util'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import GroupModel from '../../models/group'
import LayerModel from '../../models/layer'
import MapModel from '../../models/map'
import StoryModel from '../../models/story'
import UserModel from '../../models/user'
import ImageModel from '../../models/image'

const debug = DebugService('mutations/groups')

export default {
  async createGroup(
    _: unknown,
    {
      group_id,
      name,
      description
    }: {
      group_id: string
      name: LocalizedString
      description: LocalizedString
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    if (group_id) {
      const result = await GroupModel.createGroup(
        group_id,
        name,
        description,
        user.sub
      )

      return result
    }
  },
  async saveGroup(
    _: unknown,
    {
      group_id,
      name,
      description
    }: {
      group_id: string
      name: LocalizedString
      description: LocalizedString
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    if (group_id) {
      if (await GroupModel.isGroupAdmin(group_id, user.sub)) {
        const result = await GroupModel.updateGroup(group_id, name, description)
        return result
      } else {
        throw new Error('Not allowed to modify group')
      }
    }
  },
  async deleteGroup(
    _: unknown,
    {
      group_id
    }: {
      group_id: string
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    if (group_id) {
      if (await GroupModel.isGroupAdmin(group_id, user.sub)) {
        // check if the group has any layers, maps, or stories
        const layers = await LayerModel.getGroupLayers(group_id, false)
        if (layers && layers.length > 0) {
          throw new Error(
            'Group has layers: You must first delete all the layers in this group'
          )
        }
        const maps = await MapModel.getGroupMaps(group_id)
        if (maps && maps.length > 0) {
          throw new Error(
            'Group has maps: You must first delete all the maps in this group'
          )
        }
        const stories = await StoryModel.getGroupStories(group_id, true)
        if (stories && stories.length > 0) {
          throw new Error(
            'Group has stories: You must first delete all the stories in this group'
          )
        }
        const result = await GroupModel.deleteGroup(group_id)
        return result
      } else {
        throw new Error('Not allowed to delete group')
      }
    }
  },
  async addGroupMember(
    _: unknown,
    {
      group_id,
      user_id,
      asAdmin
    }: {
      group_id: string
      user_id: number
      asAdmin: boolean
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    if (group_id) {
      if (await GroupModel.isGroupAdmin(group_id, user.sub)) {
        const role = asAdmin ? 'Administrator' : 'Member'

        const dbUser = await UserModel.getUser(user_id)

        const members = await GroupModel.getGroupMembers(group_id)
        let alreadyInGroup = false
        for (const member of members) {
          if (member.id === dbUser.id) {
            alreadyInGroup = true
          }
        }

        if (!alreadyInGroup) {
          await GroupModel.addGroupMember(group_id, dbUser.id, role)
          debug.log(`Added ${dbUser.email} to ${group_id}`)
          Email.send({
            from: process.env.NEXT_PUBLIC_PRODUCT_NAME + ' <info@maphubs.com>',
            to: dbUser.email,
            subject: `Welcome to Group: ${group_id} - ${process.env.NEXT_PUBLIC_PRODUCT_NAME}`,
            text: `You have been added to the group ${group_id}`,
            html: `You have been added to the group ${group_id}`
          })
          return true
        } else {
          throw new Error('User is already a member of this group')
        }
      } else {
        throw new Error('Not allowed to modify group')
      }
    }
  },
  async setGroupMemberRole(
    _: unknown,
    {
      group_id,
      user_id,
      admin
    }: {
      group_id: string
      user_id: number
      admin: boolean
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context

    if (group_id) {
      if (await GroupModel.isGroupAdmin(group_id, user.sub)) {
        const role = admin ? 'Administrator' : 'Member'
        const dbUser = await UserModel.getUser(user_id)
        await GroupModel.updateGroupMemberRole(group_id, dbUser.id, role)
        debug.log(`Added role ${role} to ${dbUser.email} of ${group_id}`)
        return true
      } else {
        throw new Error('Not allowed to modify group')
      }
    }
  },
  async removeGroupMember(
    _: unknown,
    {
      group_id,
      user_id
    }: {
      group_id: string
      user_id: number
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context

    if (group_id) {
      if (await GroupModel.isGroupAdmin(group_id, user.sub)) {
        const dbUser = await UserModel.getUser(user_id)
        // don't allow removal of last admin
        const members = await GroupModel.getGroupMembersByRole(
          group_id,
          'Administrator'
        )

        if (members && members.length === 1 && members[0].id === user_id) {
          // last admin
          debug.log(
            'Attempted to delete last admin ' +
              dbUser.email +
              ' from ' +
              group_id
          )
          throw new Error(
            'Unable to delete only administrator from the group. Please assign another admin first.'
          )
        } else {
          await GroupModel.removeGroupMember(group_id, dbUser.id)
          debug.log('Removed ' + dbUser.email + ' from ' + group_id)

          return true
        }
      } else {
        throw new Error('Not allowed to modify group')
      }
    }
  },
  async setGroupImage(
    _: unknown,
    {
      group_id,
      image,
      info
    }: {
      group_id: string
      image: string
      info: Record<string, unknown>
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context

    if (group_id) {
      if (await GroupModel.isGroupAdmin(group_id, user.sub)) {
        await ImageModel.setGroupImage(group_id, image, info)
        return true
      } else {
        throw new Error('Not allowed to modify group')
      }
    }
  }
}
