export const deleteData = async (
  layer_id: number
): Promise<Record<string, unknown>> => {
  const response = await fetch('/api/layer/deletedata/' + layer_id, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const result = await response.json()
  if (result.success) {
    return {}
  } else {
    throw new Error(result.message || 'Server Error')
  }
}
