import { LocalizedString } from '../../../types/LocalizedString'

export const saveStory = async (data: {
  story_id: number
  owned_by_group_id: string
  body: LocalizedString
  title: LocalizedString
  author: LocalizedString
  summary: LocalizedString
  published: boolean
  published_at: string
  tags: string[]
  firstimage: string
}): Promise<Record<string, unknown>> => {
  const {
    story_id,
    owned_by_group_id,
    body,
    title,
    author,
    summary,
    published,
    published_at,
    tags,
    firstimage
  } = data
  const response = await fetch('/api/story/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      story_id,
      owned_by_group_id,
      body,
      title,
      author,
      summary,
      published,
      published_at,
      tags,
      firstimage
    })
  })
  const result = await response.json()
  if (result.success) {
    return {}
  } else {
    throw new Error(result.message || 'Server Error')
  }
}
