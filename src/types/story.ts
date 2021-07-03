import { LocalizedString } from './LocalizedString'
export type Story = {
  story_id: string
  title: LocalizedString
  firstimage?: string
  summary: LocalizedString
  published: boolean
}
