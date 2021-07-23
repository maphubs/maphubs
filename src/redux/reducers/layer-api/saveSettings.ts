export const saveSettings = async (
  layer_id: number,
  data: Record<string, any>,
  initLayer: boolean
): Promise<boolean> => {
  const response = await fetch('/api/layer/admin/saveSettings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      layer_id,
      name: data.name,
      description: data.description,
      group_id: data.group,
      private: data.private,
      source: data.source,
      license: data.license
    })
  })
  const result = await response.json()
  if (result.success) {
    return true
  } else {
    throw new Error(result.message || 'Server Error')
  }
}
