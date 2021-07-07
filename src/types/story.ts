import { LocalizedString } from './LocalizedString'
export type Story = {
  story_id: string
  title: LocalizedString
  firstimage?: string
  summary: LocalizedString
  published: boolean
  author: LocalizedString
  owned_by_group_id: string
  groupname: LocalizedString
  published_at: string
}
