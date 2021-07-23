export const saveExternalLayerConfig = async (
  layer_id: number,
  config: string
): Promise<Record<string, unknown>> => {
  const response = await fetch('/api/layer/admin/saveExternalLayerConfig', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ layer_id, external_layer_config: config })
  })

  const result = await response.json()
  if (result.success) {
    return true
  } else {
    throw new Error(result.message || 'Server Error')
  }
}
