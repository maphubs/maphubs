import { LocalizedString } from './LocalizedString'
export type Story = {
  id: string
  title: LocalizedString
  body: LocalizedString
  image?: string
  summary: LocalizedString
  published: boolean
  author: LocalizedString
  published_at: string
  updated_by?: number
}
