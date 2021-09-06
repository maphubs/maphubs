export const deleteStory = async (
  story_id: number
): Promise<Record<string, unknown>> => {
  const response = await fetch('/api/story/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      story_id
    })
  })
  const result = await response.json()
  if (result.success) {
    return {}
  } else {
    throw new Error(result.message || 'Server Error')
  }
}
