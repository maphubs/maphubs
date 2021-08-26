export const saveStyle = async (
  layer_id: number,
  data: Record<string, any>
): Promise<boolean> => {
  const response = await fetch('/api/layer/admin/saveStyle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      layer_id,
      style: data.style,
      labels: data.labels,
      legend_html: data.legend_html,
      preview_position: data.preview_position
    })
  })
  const result = await response.json()
  if (result.success) {
    return true
  } else {
    throw new Error(result.message || 'Server Error')
  }
}
