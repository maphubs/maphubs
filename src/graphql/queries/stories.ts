import StoryModel from '../../models/story'
import GroupModel from '../../models/group'
import { Story } from '../../types/story'
import { Context } from '../../types/graphqlContext'

export default {
  stories(): Promise<Story[]> {
    return StoryModel.getAllStories()
  },

  story(_: unknown, args: { id: number }): Promise<Story | void> {
    return StoryModel.getStoryById(args.id)
  },

  featuredStories(_: unknown, args: { limits: number }): Promise<Story[]> {
    return StoryModel.getFeaturedStories(args.limits)
  },

  recentStories(
    _: unknown,
    args: { limits: number; tags?: string[] }
  ): Promise<Story[]> {
    return StoryModel.getRecentStories({
      number: args.limits,
      tags: args.tags
    })
  },

  allowedToModifyStory(
    _: unknown,
    args: { id: number },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    return StoryModel.allowedToModify(args.id, user.sub)
  },

  async groupStories(
    _: unknown,
    args: { id: string },
    context: Context
  ): Promise<Story[]> {
    const { user } = context
    // can this user edit the group's stories
    const canEdit = await GroupModel.allowedToModify(args.id, user.sub)
    return StoryModel.getGroupStories(args.id, canEdit)
  }
}
