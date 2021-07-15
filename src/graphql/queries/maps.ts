import MapModel from '../../models/map'
import { Map } from '../../types/map'
import { Context } from '../../types/graphqlContext'
import { Layer } from '../../types/layer'

export default {
  maps(): Promise<Map[]> {
    return MapModel.getAllMaps()
  },

  map(_: unknown, args: { id: number }): Promise<Map | void> {
    return MapModel.getMap(args.id)
  },

  featuredMaps(_: unknown, args: { limits: number }): Promise<Map[]> {
    return MapModel.getFeaturedMaps(args.limits)
  },

  recentMaps(_: unknown, args: { limits: number }): Promise<Map[]> {
    return MapModel.getRecentMaps(args.limits)
  },

  popularMaps(_: unknown, args: { limits: number }): Promise<Map[]> {
    return MapModel.getPopularMaps(args.limits)
  },

  mapLayers(_: unknown, args: { id: number }): Promise<Layer[]> {
    return MapModel.getMapLayers(args.id)
  },

  allowedToModifyMap(
    _: unknown,
    args: { id: number },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    return MapModel.allowedToModify(args.id, user.sub)
  },

  async groupMaps(_: unknown, args: { id: string }): Promise<Map[]> {
    return MapModel.getGroupMaps(args.id)
  }
}
