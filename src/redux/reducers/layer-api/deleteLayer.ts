export const deleteLayer = async (
  layer_id: number
): Promise<Record<string, unknown>> => {
  const response = await fetch('/api/layer/admin/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      layer_id
    })
  })
  const result = await response.json()
  if (result.success) {
    return {}
  } else {
    throw new Error(result.message || 'Server Error')
  }
}
