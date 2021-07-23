export const saveAdminSettings = async (
  layer_id: number,
  data: {
    group: string
    disableExport: boolean
    allowPublicSubmit: boolean
  }
): Promise<boolean> => {
  const response = await fetch('/api/layer/admin/saveAdminSettings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      layer_id,
      group_id: data.group,
      disable_export: data.disableExport,
      allow_public_submit: data.allowPublicSubmit
    })
  })
  const result = await response.json()
  if (result.success) {
    return true
  } else {
    throw new Error(result.message || 'Server Error')
  }
}
