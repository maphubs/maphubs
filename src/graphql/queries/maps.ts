import MapModel from '../../models/map'
import LayerModel from '../../models/layer'
import { Map } from '../../types/map'
import { Context } from '../../types/graphqlContext'
import { Layer } from '../../types/layer'

export default {
  maps(_: unknown, args: { locale: string }): Promise<Map[]> {
    return MapModel.getAllMaps().orderByRaw(
      `lower((omh.maps.title -> '${args.locale || 'en'}')::text)`
    )
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

  myMaps(_: unknown, __: unknown, context: Context): Promise<boolean> {
    const { user } = context
    return MapModel.getUserMaps(user.sub)
  },

  async mapLayers(
    _: unknown,
    args: { id: number; attachPermissions?: boolean },
    context: Context
  ): Promise<Layer[]> {
    const { user } = context
    let layers = await MapModel.getMapLayers(args.id)
    if (args.attachPermissions) {
      layers = await LayerModel.attachPermissionsToLayers(layers, user.sub)
    }
    return layers
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
