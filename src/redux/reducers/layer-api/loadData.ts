export const loadData = async (layer_id: number): Promise<boolean> => {
  const response = await fetch('/api/layer/create/savedata/' + layer_id, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const result = await response.json()
  if (result.success) {
    return true
  } else {
    throw new Error(result.message || 'Server Error')
  }
}
