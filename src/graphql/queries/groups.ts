import GroupModel from '../../models/group'
import { Group } from '../../types/group'
import { Context } from '../../types/graphqlContext'

export default {
  groups(
    _: unknown,
    args: { locale?: string },
    context: Context
  ): Promise<Array<Group>> {
    //const { user } = context
    return GroupModel.getAllGroups().orderByRaw(
      `lower((omh.groups.name -> '${args.locale || 'end'}')::text)`
    )
  },

  group(
    _: unknown,
    args: { id: string },
    context: Context
  ): Promise<Group | void> {
    const { user } = context
    return GroupModel.byID(args.id)
  }
}
