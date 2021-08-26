import { Context } from '../../types/graphqlContext'
import { LocalizedString } from '../../types/LocalizedString'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import GroupModel from '../../models/group'
import LayerModel from '../../models/layer'
import MapModel from '../../models/map'
import StoryModel from '../../models/story'
import UserModel from '../../models/user'
import ImageModel from '../../models/image'
import safeCompare from 'safe-compare'

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
      name: string
      description: string
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    if (group_id) {
      await GroupModel.createGroup(
        group_id,
        JSON.parse(name) as LocalizedString,
        JSON.parse(description) as LocalizedString,
        Number.parseInt(user.sub)
      )

      return true
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
      name: string
      description: string
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    if (group_id) {
      if (await GroupModel.isGroupAdmin(group_id, Number.parseInt(user.sub))) {
        await GroupModel.updateGroup(
          group_id,
          JSON.parse(name) as LocalizedString,
          JSON.parse(description) as LocalizedString
        )
        return true
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
      if (await GroupModel.isGroupAdmin(group_id, Number.parseInt(user.sub))) {
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
      if (await GroupModel.isGroupAdmin(group_id, Number.parseInt(user.sub))) {
        const role = admin ? 'Administrator' : 'Member'
        const dbUser = await UserModel.byID(user_id)
        if (dbUser) {
          await GroupModel.updateGroupMemberRole(group_id, dbUser.id, role)
          debug.log(`Added role ${role} to ${dbUser.email} of ${group_id}`)
          return true
        } else {
          throw new Error('User not found')
        }
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
      if (await GroupModel.isGroupAdmin(group_id, Number.parseInt(user.sub))) {
        const dbUser = await UserModel.byID(user_id)
        if (dbUser) {
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
          throw new Error('User not found')
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
      info: string
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context

    if (group_id) {
      if (await GroupModel.isGroupAdmin(group_id, Number.parseInt(user.sub))) {
        await ImageModel.setGroupImage(group_id, image, JSON.parse(info))
        return true
      } else {
        throw new Error('Not allowed to modify group')
      }
    }
  },

  async rotateJoinCode(
    _: unknown,
    {
      group_id
    }: {
      group_id: string
    },
    context: Context
  ): Promise<string> {
    const { user } = context

    if (
      group_id &&
      (await GroupModel.isGroupAdmin(group_id, Number.parseInt(user.sub)))
    ) {
      const newCode = await GroupModel.rotateJoinCode(group_id)
      return newCode
    } else {
      throw new Error('Not allowed to modify group')
    }
  },

  async joinGroup(
    _: unknown,
    {
      group_id,
      join_code
    }: {
      group_id: string
      join_code: string
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context

    const user_id = Number.parseInt(user.sub)

    if (group_id && join_code) {
      const code = await GroupModel.getGroupJoinCode(group_id)
      if (safeCompare(code, join_code)) {
        const existingMembers = await GroupModel.getGroupMembers(group_id)
        const existingMember = existingMembers.find((u) => u.id === user_id)
        if (!existingMember) {
          await GroupModel.addGroupMember(group_id, user_id, 'Member')
          return true
        } else {
          throw new Error('You are already a member of this group')
        }
      } else {
        throw new Error('Missing required data') // intentionally vague error message
      }
    } else {
      throw new Error('Missing required data')
    }
  }
}
