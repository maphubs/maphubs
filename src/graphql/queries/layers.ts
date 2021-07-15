import LayerModel from '../../models/layer'
import StatsModel from '../../models/stats'
import GroupModel from '../../models/group'
import { Layer } from '../../types/layer'
import { Context } from '../../types/graphqlContext'
import stories from './stories'

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

  popularLayers(_: unknown, args: { limits: number }): Promise<Layer[]> {
    return LayerModel.getPopularLayers(args.limits)
  },

  layerStats(
    _: unknown,
    args: { id: number }
  ): Promise<{ maps: number; stories: number; viewsByDay: any }> {
    return StatsModel.getLayerStats(args.id)
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
