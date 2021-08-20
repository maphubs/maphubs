const fetcher = (
  mutation: string,
  admin?: boolean
): Promise<Record<string, any>> =>
  fetch(admin ? '/api/graphql-admin' : '/api/graphql', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      query: `mutation { ${mutation} }`
    })
  }).then(async (res) => {
    let body

    try {
      body = await res.json()
    } catch {
      console.error('API respsonse missing body')
    }

    if (res.status === 400) {
      const error = body?.errors
        ? new Error(body.errors[0].message)
        : new Error('API Request Failed')
      throw error
    }

    if (res.status === 401) {
      const error = body?.error
        ? new Error(body.error)
        : new Error('API Request Unauthorized')
      throw error
    }

    return body?.data
  })

export default fetcher
