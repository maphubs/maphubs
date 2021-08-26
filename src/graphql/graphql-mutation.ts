const fetcher = async (
  mutation: string,
  admin?: boolean
): Promise<Record<string, any>> => {
  const res = await fetch(admin ? '/api/graphql-admin' : '/api/graphql', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      query: `mutation { ${mutation} }`
    })
  })

  const body: { data: any; errors?: any } = await res.json()

  if (res.status === 401) {
    throw new Error('API Request Unauthorized')
  }

  if (res.status === 400) {
    const error = body?.errors
      ? new Error(body.errors[0].message)
      : new Error('API Request Failed')
    throw error
  }

  if (body?.errors) {
    const firstError = body.errors[0]
    throw new Error(firstError.message)
  }

  return body?.data
}

export default fetcher
