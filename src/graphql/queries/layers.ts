import LayerModel from '../../models/layer'
import StatsModel from '../../models/stats'
import { Layer } from '../../types/layer'
import { Context } from '../../types/graphqlContext'

export default {
  layers(): Promise<Layer[]> {
    return LayerModel.getAllLayers(false)
  },

  layer(_: unknown, args: { id: number }): Promise<Layer | void> {
    return LayerModel.getLayerByID(args.id)
  },

  featuredLayers(_: unknown, args: { limits: number }): Promise<Layer[]> {
    return LayerModel.getFeaturedLayers(args.limits)
  },

  recentLayers(_: unknown, args: { limits: number }): Promise<Layer[]> {
    return LayerModel.getRecentLayers(args.limits)
  },

  async popularLayers(
    _: unknown,
    args: { limits: number; attachPermissions?: boolean },
    context: Context
  ): Promise<Layer[]> {
    const { user } = context
    let layers = await LayerModel.getPopularLayers(args.limits)
    if (args.attachPermissions) {
      layers = await LayerModel.attachPermissionsToLayers(layers, user.sub)
    }
    return layers
  },

  async myLayers(
    _: unknown,
    args: { limits: number },
    context: Context
  ): Promise<Layer[]> {
    const { user } = context
    const layers = await LayerModel.getUserLayers(user.sub, args.limits)
    return LayerModel.attachPermissionsToLayers(layers, user.sub)
  },

  layerStats(
    _: unknown,
    args: { id: number }
  ): Promise<{ maps: number; stories: number }> {
    return StatsModel.getLayerStats(args.id)
  },

  layerNotes(_: unknown, args: { id: number }): Promise<{ notes: string }> {
    return LayerModel.getLayerNotes(args.id)
  },

  allowedToModifyLayer(
    _: unknown,
    args: { id: number },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    return LayerModel.allowedToModify(args.id, user.sub)
  },

  groupLayers(
    _: unknown,
    args: { id: string; includeMapInfo?: boolean }
  ): Promise<Layer[]> {
    return LayerModel.getGroupLayers(args.id, args.includeMapInfo)
  }
}
