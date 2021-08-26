import GroupModel from '../../models/group'
import { Group } from '../../types/group'
import { Context } from '../../types/graphqlContext'

export default {
  groups(_: unknown, args: { locale?: string }): Promise<Group[]> {
    return GroupModel.getAllGroups().orderByRaw(
      `lower((omh.groups.name -> '${args.locale || 'en'}')::text)`
    )
  },

  group(_: unknown, args: { id: string }): Promise<Group | void> {
    return GroupModel.getGroupByID(args.id)
  },

  featuredGroups(_: unknown, args: { limits: number }): Promise<Group[]> {
    return GroupModel.getFeaturedGroups(args.limits)
  },

  recentGroups(_: unknown, args: { limits: number }): Promise<Group[]> {
    return GroupModel.getRecentGroups(args.limits)
  },

  allowedToModifyGroup(
    _: unknown,
    args: { id: string },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    return GroupModel.allowedToModify(args.id, user.sub)
  },

  async groupMembers(
    _: unknown,
    args: { id: string },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    // only reveal the members list to other members
    const canEdit = await GroupModel.allowedToModify(args.id, user.sub)
    if (canEdit) {
      return GroupModel.getGroupMembers(args.id)
    } else {
      throw new Error('Unauthorized')
    }
  }
}
